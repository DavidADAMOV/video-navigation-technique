import sys
import os
import json

#DIRECTORY = "./medias"

def generate_json_data(from_this_directory):
    temp_video_file_name = "temporary"
    video_file_name = "medias_info"

    json_video_files = {}

    media_list = os.listdir(from_this_directory)

    for media in media_list:
        if(media.split('.')[-1]=="json"):
            animation_fd = open(from_this_directory+"/"+media)
            json_animation = json.load(animation_fd)
            animation_fd.close()
            json_video_files[media] = {
                "streams" : [{
                    "avg_frame_rate" : "30/1",
                    "duration" : str(len(json_animation)-1)
                }]
            }
        elif(media.split('.')[-1]=="mp4"):
            bashCommand = "ffprobe -v error -select_streams v:0 -show_entries stream=avg_frame_rate,duration -of default=noprint_wrappers=1:nokey=1 -output_format json \""+from_this_directory+"/"+media+"\" > \""+temp_video_file_name+".json\""
            os.system(bashCommand)
            
            temp_video_file = open("./"+temp_video_file_name+".json","r")
            #print(temp_video_file.read())
            json_temp_elt = json.load(temp_video_file)
            json_video_files[media] = json_temp_elt
            temp_video_file.close()


    os.remove(temp_video_file_name+".json")

    video_file = open(from_this_directory+"/../"+video_file_name+".json","w")
    json.dump(json_video_files,video_file,indent=2)

if __name__ == "__main__" :
    if (len(sys.argv)<2):
        print("ERROR : You must put an argument that contains the name of a directory that contains videos ")
        exit()
    generate_json_data(sys.argv[1])