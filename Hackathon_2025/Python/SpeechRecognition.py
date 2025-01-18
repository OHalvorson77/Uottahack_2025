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


conversation_history = []
@app.route('/transcript', methods=['POST'])
def receive_transcript():
    global conversation_history
    data = request.get_json()
    transcript = data.get('transcript', '')

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
    audio_stream = elevenclient.text_to_speech.convert_as_stream(text=model_response, voice_id='CZnaDN40v7JYigHcaARz', model_id='eleven_multilingual_v2')

    # Collect audio data into a byte stream
    audio_data = b''.join(chunk for chunk in audio_stream if isinstance(chunk, bytes))

    # Encode audio data to base64 to send as JSON
    audio_base64 = base64.b64encode(audio_data).decode('utf-8')

    # Add the model's response to the conversation history
    conversation_history.append({"role": "assistant", "content": model_response})

    print(f"Received Transcript: {transcript}")
    return jsonify({"message": model_response, "audio": audio_base64}), 200

if __name__ == '__main__':
    app.run(debug=True)
