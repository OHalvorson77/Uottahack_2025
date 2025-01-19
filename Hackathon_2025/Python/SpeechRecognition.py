import base64
from flask import Flask, request, jsonify, Response
from flask_cors import CORS

app = Flask(__name__)

CORS(app)  

import os
from groq import Groq

from elevenlabs.client import ElevenLabs

from elevenlabs import stream

elevenclient = ElevenLabs(api_key='sk_f81fc187f14dbe8890f271c2d0ca8a096792d78c8d18d4c1')

client = Groq(api_key="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")

import mysql.connector

def get_db_connection():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='Hockey@2003',
        database='hackathon_2025'
    )

@app.route('/api/videos', methods=['GET'])
def get_videos():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Query to get videos
        query = "SELECT id, name, video FROM videos"
        cursor.execute(query)
        results = cursor.fetchall()

        # Convert BLOB to Base64
        videos = [
            {
                "id": video["id"],
                "name": video["name"],
                "video": f"data:video/mp4;base64,{base64.b64encode(video['video']).decode('utf-8')}"
            }
            for video in results
        ]

        return jsonify(videos)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Upload endpoint
@app.route('/api/upload', methods=['POST'])
def upload_video():
    print("REACHED")
    if 'video' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    video = request.files['video']

    if video.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # Read the video file into binary
        video_data = video.read()

        # Store the video in the database as BLOB
        connection = get_db_connection()
        cursor = connection.cursor()

        query = "INSERT INTO videos (name, video) VALUES (%s, %s)"
        cursor.execute(query, (video.filename, video_data))
        connection.commit()

        return jsonify({'message': 'Video uploaded successfully'}), 200

    except Exception as e:
        print(str(e))
        return jsonify({'error': str(e)}), 500

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


conversation_history = []
@app.route('/transcript', methods=['POST'])
def receive_transcript():
    global conversation_history
    data = request.get_json()
    transcript = data.get('transcript', '')
    voiceID = data.get('voiceID', '')


    if transcript in ['Stop.', 'stop', 'Stop']:
        conversation_history = []
        return jsonify({"message": "I have been reset"}), 200

    
    # Add the new user message to the conversation history
    conversation_history.append({"role": "user", "content": transcript})

    # Send the entire conversation history as context
    chat_completion = client.chat.completions.create(
        messages=conversation_history, 
        model="llama3-8b-8192"
    )

    # Get the model's response
    model_response = chat_completion.choices[0].message.content

    # Generate audio stream
    audio_stream = elevenclient.text_to_speech.convert_as_stream(text=model_response, voice_id=voiceID, model_id='eleven_multilingual_v2')

    # Collect audio data into a byte stream
    audio_data = b''.join(chunk for chunk in audio_stream if isinstance(chunk, bytes))

    # Encode audio data to base64 to send as JSON
    audio_base64 = base64.b64encode(audio_data).decode('utf-8')

    # Add the model's response to the conversation history
    conversation_history.append({"role": "assistant", "content": model_response})

    conversation_history.append({"role": "user", "content": "Can you write a very short jot note explanation of what you just said using math equations if needed"})


    chat_completion2 = client.chat.completions.create(
        messages=conversation_history, 
        model="llama3-8b-8192"
    )

    model_response2 = chat_completion2.choices[0].message.content

    print(f"Received Transcript: {transcript}")
    return jsonify({"message": model_response, "notes": model_response2, "audio": audio_base64 }), 200 #audio needs to be added

@app.route('/sendNotes', methods=['POST'])
def send_notes():
    global conversation_history
    data = request.get_json()
    transcript = data.get('transcript', '')



    # Add the new user message to the conversation history
    conversation_history.append({"role": "user", "content": transcript})

    # Send the entire conversation history as context
    chat_completion = client.chat.completions.create(
        messages=conversation_history, 
        model="llama3-8b-8192"
    )

    # Get the model's response
    model_response = chat_completion.choices[0].message.content

    # Add the model's response to the conversation history
    conversation_history.append({"role": "assistant", "content": model_response})

    print(f"Received Transcript: {transcript}")
    return jsonify({"message": model_response}), 200

if __name__ == '__main__':
    app.run(debug=True)
