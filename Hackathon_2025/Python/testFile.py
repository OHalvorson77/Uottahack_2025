from elevenlabs.client import ElevenLabs

from elevenlabs import stream

client = ElevenLabs(api_key='sk_f81fc187f14dbe8890f271c2d0ca8a096792d78c8d18d4c1')

audio_stream=client.text_to_speech.convert_as_stream(text='This is a test', voice_id='eRFqJyayBOSH1zZWiI7R', model_id='eleven_multilingual_v2')

for chunk in audio_stream: 
    if isinstance(chunk, bytes):
        print(chunk)
