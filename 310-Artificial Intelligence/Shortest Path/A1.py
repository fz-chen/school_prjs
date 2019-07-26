class node:
  def __init__(self, x, y, value, parent):
    self.x = x
    self.y = y
    self.value = value
    self.parent = parent

from operator import attrgetter
import numpy as np

global n, gx, gy, best_first_search_nodes, best_first_searched_nodes, matrix
best_first_search_nodes = []
best_first_searched_nodes = []

#reading the data and assigning them to variables
def readFile(filename):
    global n, gx, gy
    f = open(filename, "r")
    input_data = f.read()
    input_data = input_data.split('\n')
    n = int(input_data[0])
    start_and_end = input_data[1].split(' ')
    start_pos = start_and_end[0].replace('[','').replace(']','').split(',')
    end_pos = start_and_end[2].replace('[','').replace(']','').split(',')
    matrix_empty = [[0 for x in range(n)] for y in range(n)]
    row = 0
    for x in input_data[2:]:
        x = x[1:]
        x = x.replace('[','')
        x = x.replace(']','')
        
        x = x.split(' ')
        col = 0
        for y in x:
            matrix_empty[row][col] = int(y)
            col += 1
        row += 1

    matrix = np.asarray(matrix_empty)
    gx = int(end_pos[0])
    gy = int(end_pos[1])
    return n, start_pos, matrix

def nodeInList(input_list,x,y):
    for i, o in enumerate(input_list):
        if(o.x == x and o.y == y):
            return True
    return False

def popSearchNode(x,y):
    global best_first_search_nodes
    for i, o in enumerate(best_first_search_nodes):
        if(o.x == x and o.y == y):
            best_first_search_nodes.remove(o)

def findNode(input_list,x,y):
    for i, o in enumerate(input_list):
        if(o.x == x and o.y == y):
            return o
    return False

def createSubMatrix(matrix,x,y):
    global gx, gy
    x_a, x_b = min(x, gx), max(x, gx)
    y_a, y_b = min(y, gy), max(y, gy)
    return matrix[x_a:x_b+1,y_a:y_b+1]

def findHeuristic(x,y,sub_matrix):
    global gx, gy
    min_steps = abs(gx-x) + abs(gy-y)
    number_of_nodes = abs(gx+1-x) * abs(gy+1-y)
    if number_of_nodes == 0:
        number_of_nodes = 1
    average_sum_row = np.sum(abs(np.diff(sub_matrix)))
    average_sum_col = np.sum(abs(np.diff(sub_matrix, axis=0)))
    estimate = (average_sum_row + average_sum_col)/number_of_nodes + min_steps
    return estimate

def matrixDifference(x1,y1,x2,y2):
    return abs(matrix[x1][y1] - matrix[x2][y2])

def expandBestFirstFringe(current_node):
    global n, gx, gy, best_first_search_nodes, best_first_searched_nodes, matrix
    x = current_node.x
    y = current_node.y
    best_first_searched_nodes.append(current_node)
    popSearchNode(x,y)
    if(x>0):
        x_child_u = x-1 #x child up
        if matrixDifference(x,y,x_child_u,y)<4 and not nodeInList(best_first_searched_nodes,x_child_u,y):
            sub_matrix = createSubMatrix(matrix, x_child_u, y)
            heur = findHeuristic(x_child_u, y, sub_matrix) + matrixDifference(x,y,x_child_u,y) + 1 #the add one here is for the manditotry fixed cost for making one move
            best_first_search_nodes.append(node(x_child_u,y,heur,current_node))
    if(y<n-1):
        y_child_r = y+1 #y child right
        if matrixDifference(x,y,x,y_child_r)<4 and not nodeInList(best_first_searched_nodes,x,y_child_r):
            sub_matrix = createSubMatrix(matrix, x, y_child_r)
            heur = findHeuristic(x, y_child_r, sub_matrix) + matrixDifference(x,y,x,y_child_r) + 1
            best_first_search_nodes.append(node(x,y_child_r,heur,current_node))
    if(x<n-1):
        x_child_d = x+1 #x child down
        if matrixDifference(x,y,x_child_d,y)<4 and not nodeInList(best_first_searched_nodes,x_child_d,y):
            sub_matrix = createSubMatrix(matrix, x_child_d, y)
            heur = findHeuristic(x_child_d, y, sub_matrix) + matrixDifference(x,y,x_child_d,y) + 1
            best_first_search_nodes.append(node(x_child_d,y,heur,current_node))
    if(y>0):
        y_child_l = y-1 #y child left
        if matrixDifference(x,y,x,y_child_l)<4 and not nodeInList(best_first_searched_nodes,x,y_child_l):
            sub_matrix = createSubMatrix(matrix, x, y_child_l)
            heur = findHeuristic(x, y_child_l, sub_matrix) + matrixDifference(x,y,x,y_child_l) + 1
            best_first_search_nodes.append(node(x,y_child_l,heur,current_node))
    

n, start_pos, matrix = readFile("data.txt")
start_pos[0] = int(start_pos[0])
start_pos[1] = int(start_pos[1])

initial_node = node('initial node','initial node','initial node','initial node')
start_node = node(start_pos[0], start_pos[1], 0, initial_node)
expandBestFirstFringe(start_node)

#stop if the goal node is found, or the search list is empty
while best_first_search_nodes and not nodeInList(best_first_searched_nodes,gx,gy):
    min_node = min(best_first_search_nodes,key=attrgetter('value'))
    #because we dont care how we got here, so as long as it is searched it is fine
    if nodeInList(best_first_searched_nodes, min_node.x, min_node.y):
        popSearchNode(min_node.x,min_node.y)
    else:
        expandBestFirstFringe(min_node)

best_first_path = []
best_first_path_sum = 0
best_first_path_steps = 0
best_first_node_searched = 0
if findNode(best_first_searched_nodes,gx,gy):
    temp_node = findNode(best_first_searched_nodes,gx,gy)
    while not (temp_node.x == start_pos[0] and temp_node.y == start_pos[1]):
        difference = matrixDifference(temp_node.x, temp_node.y, temp_node.parent.x, temp_node.parent.y)
        best_first_path_sum += difference + 1
        best_first_path_steps += 1
        coordinates = str(temp_node.x) + ',' +  str(temp_node.y)
        best_first_path = [coordinates] + best_first_path
        temp_node = temp_node.parent
    best_first_path = [str(start_pos[0]) + ',' + str(start_pos[1])] + best_first_path

    print('The Best First Search has successfully found a path.')
    print(best_first_path)
    print('It used a total of', best_first_path_steps,'steps.')
    print('The sum cost of the steps (including elevation difference) is', best_first_path_sum)
else:
    print('No path found using best first search.')


if best_first_searched_nodes:
    print('The following nodes were searched using the best first search method.')
    print('[',end='')
    for i, o in enumerate(best_first_searched_nodes):
        best_first_node_searched += 1
        print("'%i,%i', "% (o.x,o.y), end='')
    print(']')
    print('The for a total of', best_first_node_searched, 'nodes.')


class a_star_node:
  def __init__(self, x, y, value, parent, distance):
    self.x = x
    self.y = y
    self.value = value
    self.parent = parent
    self.distance = distance


global a_star_search_nodes, a_star_searched_nodes
a_star_search_nodes = []
a_star_searched_nodes = []

def popAStarSearchNode(x,y):
    global a_star_search_nodes
    for i, o in enumerate(a_star_search_nodes):
        if(o.x == x and o.y == y):
            a_star_search_nodes.remove(o)

def expandAStarFringe(current_node):
    global n, gx, gy, a_star_search_nodes, a_star_searched_nodes, matrix
    x = current_node.x
    y = current_node.y
    a_star_searched_nodes.append(current_node)
    popAStarSearchNode(x,y)
    if(x>0):
        x_child_u = x-1 #x child up
        if matrixDifference(x,y,x_child_u,y)<4 and not nodeInList(a_star_searched_nodes,x_child_u,y):
            sub_matrix = createSubMatrix(matrix, x_child_u, y)
            distance_to_start = current_node.distance + matrixDifference(x,y,x_child_u,y) + 1
            heur = findHeuristic(x_child_u, y, sub_matrix) + distance_to_start
            a_star_search_nodes.append(a_star_node(x_child_u,y,heur,current_node,distance_to_start))
    if(y<n-1):
        y_child_r = y+1 #y child right
        if matrixDifference(x,y,x,y_child_r)<4 and not nodeInList(a_star_searched_nodes,x,y_child_r):
            sub_matrix = createSubMatrix(matrix, x, y_child_r)
            distance_to_start = current_node.distance + matrixDifference(x,y,x,y_child_r) + 1
            heur = findHeuristic(x, y_child_r, sub_matrix) + distance_to_start
            a_star_search_nodes.append(a_star_node(x,y_child_r,heur,current_node,distance_to_start))
    if(x<n-1):
        x_child_d = x+1 #x child down
        if matrixDifference(x,y,x_child_d,y)<4 and not nodeInList(a_star_searched_nodes,x_child_d,y):
            sub_matrix = createSubMatrix(matrix, x_child_d, y)
            distance_to_start = current_node.distance + matrixDifference(x,y,x_child_d,y) + 1 
            heur = findHeuristic(x_child_d, y, sub_matrix) + distance_to_start
            a_star_search_nodes.append(a_star_node(x_child_d,y,heur,current_node,distance_to_start))
    if(y>0):
        y_child_l = y-1 #y child left
        if matrixDifference(x,y,x,y_child_l)<4 and not nodeInList(a_star_searched_nodes,x,y_child_l):
            sub_matrix = createSubMatrix(matrix, x, y_child_l)
            distance_to_start = current_node.distance + matrixDifference(x,y,x,y_child_l) + 1
            heur = findHeuristic(x, y_child_l, sub_matrix) + distance_to_start
            a_star_search_nodes.append(a_star_node(x,y_child_l,heur,current_node,distance_to_start))


initial_node = a_star_node('initial node','initial node','initial node','initial node', 'initial_node')
start_node = a_star_node(start_pos[0], start_pos[1], 0, initial_node, 0)
expandAStarFringe(start_node)

while a_star_search_nodes and not nodeInList(a_star_searched_nodes,gx,gy):
    min_node = min(a_star_search_nodes,key=attrgetter('value'))
    expandAStarFringe(min_node)

a_star_path = []
a_star_path_sum = 0
a_star_path_steps = 0
a_star_node_searched = 0
if findNode(a_star_searched_nodes,gx,gy):
    temp_node = findNode(a_star_searched_nodes,gx,gy)
    while not (temp_node.x == start_pos[0] and temp_node.y == start_pos[1]):
        difference = matrixDifference(temp_node.x, temp_node.y, temp_node.parent.x, temp_node.parent.y)
        a_star_path_sum += difference + 1
        a_star_path_steps += 1
        coordinates = str(temp_node.x) + ',' +  str(temp_node.y)
        a_star_path = [coordinates] + a_star_path
        temp_node = temp_node.parent
    a_star_path = [str(start_pos[0]) + ',' + str(start_pos[1])] + a_star_path

    print('The A* Search has successfully found a path.')
    print(a_star_path)
    print('It used a total of', a_star_path_steps,'steps.')
    print('The sum cost of the steps (including elevation difference) is', a_star_path_sum)
else:
    print('No path found using best first search.')

if a_star_searched_nodes:
    print('The following nodes were searched using the A* search method.')
    print('[',end='')
    for i, o in enumerate(a_star_searched_nodes):
        a_star_node_searched += 1
        print("'%i,%i', "% (o.x,o.y), end='')
    print(']')
    print('The for a total of', a_star_node_searched, 'nodes.')

