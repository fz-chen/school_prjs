#include <sys/wait.h>
#include <sys/types.h>
#include <unistd.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <stdbool.h>
#include <ctype.h>


char *cmd[256]={NULL}; // parsed user input
char *history[10]={NULL}; //history array
char input[1024]; // user input
char *hist_add;	// filler string for histry 
int pipe_exist = 0;// determining if the input is a pipe
int cmd_size; // number of total commands
int pipe_size;



void type_prompt(){
	char cwd[1024];
	char host[1024];
	// checking if prompt is recieveable 
	if ( (getcwd(cwd, sizeof(cwd)) != NULL) && (gethostname(host, sizeof(host)) == 0))
		printf("%s@%s:%s$ ", getenv("LOGNAME"),host, cwd);
	else
       printf(">>>>>>error recieving prompt>>>>>>");

	return;
}

void command_read(){
	// settign input to null and recieving user input
	memset(input, '\0', sizeof(input));
	fgets(input, sizeof(input), stdin);

	return;
}

void history_update(char *hist_add){
	//Shuffleing up the history 
	int i;
	for(i = 0; i<9; i++){
		history[i] = history[i+1];
	}
	//adding on the newest history 
	history[9] = hist_add;

	return;
}


void command_parse(){
	int counter = 0;
	pipe_exist = 0;
	pipe_size = 0;
	cmd_size = 0;
	char s[]= " \t\n";
	//spliting the input using strtok function
	cmd[counter] = strtok(input, s);
	while(cmd[counter] != NULL){
		// checking if there is "|" for piping
		if (strcmp(cmd[counter], "|") == 0){
			pipe_exist = 1;
			pipe_size ++;
		}
		cmd_size ++;
		//printf("cmd[%i] is %s, and pipe = %i \n", counter, cmd[counter], pipe_exist );
     	counter++;
    	cmd[counter]=strtok(NULL,s);

	}

	pipe_size = pipe_size + pipe_exist;
	return;
}


int pipe_execute(char *pipe_input[256], int pipeKey, int first, int last){
	int pipefas[2];

	pipe(pipefas);
	pid_t pid = fork();


	 if (pid == 0){
		if (first == 1 && last == 0 && pipeKey == 0){
			//First command
			//printf("pipe first achieved\n");
			dup2(pipefas[1], STDOUT_FILENO);
		} 
		else if (first == 0 && last == 0 && pipeKey != 0){
			// Middle command
			//printf("Pipe mid achieved\n");
			dup2(pipeKey, STDIN_FILENO);
			dup2(pipefas[1], STDOUT_FILENO);
		}
		else{
			// Last command
			//printf("pipeend achieved\n");
			dup2(pipeKey, STDIN_FILENO);
		}


		if ( execvp(pipe_input[0], pipe_input) == -1 ){
			printf("Command Not Found\n");
			exit(0);
		}
	} 

	if (pipeKey != 0)
		close(pipeKey);

	close(pipefas[1]);

	if (last==1)
		close(pipefas[0]);


	return pipefas[0];


}


void pipe_parse(){

	char *pipe_input[256]={NULL};//filler string for pipes 

	int OddPipe[2];
	int EvenPipe[2];

	int pipeKey = 0; // tracks where the pipe ends 
	int first = 1;// see if it is the first command
	int last = 0;

	int current, current_pipe, current_cmd; // looping variables for pipes 

	current = 0;

	// looping all varibles and parsing them in to seperate pipe functions and executing them lawl
	for (current_cmd = 0; current_cmd < pipe_size; current_cmd++){
		//parse pipe command loop
		for(current_pipe = 0; current_pipe < cmd_size; current_pipe++){
			if( (cmd[current] == NULL) || (strcmp(cmd[current], "|") == 0) ){
				current ++;
				pipe_input[current_pipe] = NULL;
				break;
			}
			else{
				pipe_input[current_pipe] = cmd[current];
				
				current ++;
			}
		}
		//// pipe input now command of a pipe 	m

		if (current_cmd == pipe_size - 1 )
			last = 1;

		
		pipeKey = pipe_execute(pipe_input, pipeKey, first, last);

		first = 0; // the first command is already executed 
		char *pipe_input[256]={NULL};
	}


	int i;
	for (i = 0; i < pipe_size; i++)
		wait(NULL);


}





void command_esecute(){


	if (cmd[0] == NULL){
		//no input
	}

	// exit command
	else if(strcmp(cmd[0], "exit") == 0){
    exit(0);
	}

	// piperino
	else if(pipe_exist == 1){
		pipe_parse();
	}

	//printing current directory
	else if(strcmp(cmd[0], "pwd")==0){
		char cwd[1024];
		if ( (getcwd(cwd, sizeof(cwd)) != NULL))
       		printf("%s \n", cwd);
	}	
	
   //printing history
   	else if ( strcmp(cmd[0],"history") == 0){
		int i = 0;
		int x = 1;
		for(i = 0; i<10; i++){
			if(history[i]!= NULL){
				printf(" %d   %s", x, history[i]);
				x++;
			}
		}
	}



	//cd
	else if(strcmp(cmd[0], "cd") == 0){
		if (cmd[1] == NULL)
  			chdir(getenv("HOME"));
  		else{
  			if (chdir(cmd[1]) == -1)
  				printf("Directory does not exist \n");
  		}


	}

	//Child function
	else{

		pid_t pid = fork();

		if(pid<0){
			printf("Fork failed \n");
		}
		else if (pid==0){
			if (execvp(cmd[0], cmd) == -1)
        		printf("Command not found\n");
		}
		else
			wait(NULL);
	}

	return;
}



	


int main(){

	while(true){
		type_prompt();
		command_read();
		hist_add = strdup(input);
		history_update(hist_add);
		command_parse();
		command_esecute();


	}

return 0;
}
