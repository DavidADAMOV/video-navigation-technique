import json

DIR = "./medias/"
NAME = "generated_animation"

animation = []
base_position = [100.0,60.0]
animation.append(base_position)

UP = [0,-1]
DOWN = [0,1]
LEFT = [-1,0]
RIGHT = [1,0]

def min_or_max(t):
    if t[1]<0:
        return max(t)
    elif t[1]>0:
        return min(t)
    else:
        return t[0]

def mul(l:list,n:int) : return list(map(lambda x : n*x,l))
def add(l1:list,l2:list) : return list(map(lambda t : sum(t) ,zip(l1,l2)))
def limit(l,maxl) :
    return list(map(lambda t : min_or_max(t) ,zip(l,maxl)))

"""
distance en frame
speed en pixels/frames
"""
def move(direction,distance=1,speed=1):
    #dist_max = add(animation[-1],mul(direction,distance))
    s = distance

    while(s>0):
        next_frame = add(animation[-1],mul(direction,speed))
        animation.append(next_frame)
        s-=speed

########## BUGGED ANIMATION ##########
# move( add(mul(RIGHT,2),DOWN) ,50,2)
#     move(UP,50,1)
#     move( add(mul(LEFT,2),DOWN) ,50,2)
#     move(UP,50,1)
#     for _ in range(5):
#         move(RIGHT,5,0.5)
#         move(DOWN,50,1)
#         move(RIGHT,5,0.5)
#         move(UP,50,1)
#     for _ in range(5):
#         move(LEFT,5,0.5)
#         move(DOWN,50,1)
#         move(LEFT,5,0.5)
#         move(UP,50,1)
#####################################

#### ANIMATION PART #######
move(RIGHT,50,3)
move(DOWN,50,2)
move(LEFT,50,2)
move(UP,50,0.5)
###########################

json_file = open(DIR+NAME+".json","w")
json.dump(animation,json_file)
json_file.close()