from roomit.db import platforms

def update_twitch(streams):
    platforms.update_streams('twitch', streams)

def update_azubu(streams):
    platforms.update_streams('azubu', streams)