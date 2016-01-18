from roomit.db import platforms

def update_twitch(streams):
    platforms.update_streams('twitch', streams)