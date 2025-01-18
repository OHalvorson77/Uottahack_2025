import openai
from flask import Flask, request, jsonify, Response
from flask_cors import CORS

app = Flask(__name__)

CORS(app)  

import os
from groq import Groq

import os
from groq import Groq

client = Groq(api_key="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")


conversation_history = []
@app.route('/transcript', methods=['POST'])
def receive_transcript():
    global conversation_history
    data = request.get_json()
    transcript = data.get('transcript', '')

    if (transcript =='Stop.' or transcript=='stop' or transcript=='Stop'):
        conversation_history=[]
        return jsonify({"message": "I have been reset"}), 200


    else:
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

@app.route('/speak', methods=['POST'])
def speak_text():
    data = request.get_json()
    text = data.get('text', '')

    try:
        # Call OpenAI's text-to-speech API to generate audio
        response = openai.Audio.create(
            model="whisper-1",  # You can change the model to your preference
            prompt=text,
            response_format="mp3"  # Get the audio in MP3 format
        )

        # Get the audio content from the response
        audio_content = response['data']

        # Return the audio content as an MP3 response
        return Response(audio_content, mimetype='audio/mp3')

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
