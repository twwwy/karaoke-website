# Dependencies:

ffmpeg

libsndfile

redis

#Commends:

export FLASK_APP=karaoke.py

flask run

redis-server

rq worker

# Troubleshooting
To load embedded Youtube Player properly,
change 127.0.0.1 to 'localhost"

# Requirements
To Update Requirements.txt
pipdeptree -f --warn silence | grep -v '[[:space:]]' > requirements.txt
