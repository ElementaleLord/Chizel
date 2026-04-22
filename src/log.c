#include "../include/chizel.h"
#include <dirent.h>

#define LOG_NORMAL 0
#define LOG_REVERSE 1
#define LOG_SHORT 2
#define LOG_NUMBERED 3

void logHelp(){
    printf(LOG_REPORT_MSG_START"Usage:\n chz log | chz log -o | chz log -h | ");
    printf("chz log -r | chz log -b <branch> | chz log -n <number>");
}

//~ Prints a log entry differently via modes
void printEntry(char* line, int mode){
    char hash[65];
    char parentHash[65];
    char username[128];
    char email[128];
    long date;
    char message[8192];

    int fields = sscanf(
        line,
        "%64s %64s %127s %127s %ld \"%8191[^\"]\"",
        parentHash, hash, username, email, &date, message
    );

    if(fields != 6){
        printf(LOG_ERROR_MSG_START"Invalid log entry: %s\n", line);
        return;
    }

    char* fixedMsg = message;
    fixedMsg = newlineRestore(fixedMsg);
    char* shortMsg = newlineRestoreShort(message);

    switch(mode){
        case LOG_NORMAL:
            printf("- Commit Hash: %s\n", hash);
            printf("- Parent Hash: %s\n", parentHash);
            if(strcmp(username, "local") != 0 && strcmp(email, "null") != 0){
                printf("- Author: %s\n", username);
                printf("- Author Email: %s\n", email);
            }
            printf("- Commit Date: %ld\n", date);
            printf("- Commit Message: %s", fixedMsg);

            if(strstr(parentHash, "0000000")){
                printf("\n========================== END OF LOG ==========================\n");
            }else{
                printf("\n============= PRESS ANY KEY TO CONTINUE, X TO STOP =============\n");
            }
            break;

        case LOG_REVERSE:
            printf("- Commit Hash: %s\n", hash);
            printf("- Parent Hash: %s\n", parentHash);
            if(strcmp(username, "local") != 0 && strcmp(email, "null") != 0){
                printf("- Author: %s\n", username);
                printf("- Author Email: %s\n", email);
            }
            printf("- Commit Date: %ld\n", date);
            printf("- Commit Message: %s", fixedMsg);
            break;

        case LOG_SHORT:
            char shortHash[7], shortParent[7];
            strncpy(shortHash, hash, 6);
            strncpy(shortParent, parentHash, 6);
            shortHash[6] = '\0';
            shortParent[6] = '\0';

            printf("- Short Commit Hash: %s\n", shortHash);
            printf("- Short Parent Hash: %s\n", shortParent);
            printf("- Commit Title: %s", shortMsg);

            if(strstr(parentHash, "0000000")){
                printf("\n========================== END OF LOG ==========================\n");
            }else{
                printf("\n============= PRESS ANY KEY TO CONTINUE, X TO STOP =============\n");
            }
            break;

        case LOG_NUMBERED:
            printf("- Commit Hash: %s\n", hash);
            printf("- Parent Hash: %s\n", parentHash);
            if(strcmp(username, "local") != 0 && strcmp(email, "null") != 0){
                printf("- Author: %s\n", username);
                printf("- Author Email: %s\n", email);
            }
            printf("- Commit Date: %ld\n", date);
            printf("- Commit Message: %s", fixedMsg);

            break;
    }

    free(fixedMsg);
    free(shortMsg);
}

//~ Reads the logs, top to bottom, 1 at a time
void readLogsReverse(){
    char* head = getHead();
    char path[1024];

    snprintf(path, sizeof(path), "%s%s.log", LOGS_PATH, head);

    FILE* f = fopen(path, "r");
    if(!f){
        printf(LOG_ERROR_MSG_START"Error openning log file"MSG_END);
        return;
    }

    char line[8192];
    char nextLine[8192];
    char conf[16];
    bool cont = true;

    if(fgets(line, sizeof(line), f) == NULL){
        printf("\n========================== END OF LOG ==========================\n");
        fclose(f);
        return;
    }

    while(cont){
        printEntry(line, LOG_REVERSE);

        if(fgets(nextLine, sizeof(nextLine), f) == NULL){
            break;
        }

        printf("\n============= PRESS ANY KEY TO CONTINUE, X TO STOP =============\n");

        if(fgets(conf, sizeof(conf), stdin) != NULL){
            if(conf[0] == 'x' || conf[0] == 'X'){
                cont = false;
            }
        }

        strcpy(line, nextLine);
    }

    printf("\n========================== END OF LOG ==========================\n");

    fclose(f);
}

//~ Reads the logs, bottom to top, with the specified amount
void readAmountLogs(int count){
    if(count <= 0 || count > 40){
        printf(LOG_ERROR_MSG_START"Anti-overflow measures: cannot read less than 1 or more than 40");
        return;
    }

    char path[1024];

    char* head = getHead();
    snprintf(path, sizeof(path), "%s%s.log", LOGS_PATH, head);

    FILE* f = fopen(path, "r");
    if(!f){
        printf(LOG_ERROR_MSG_START"Error openning log file"MSG_END);
        return;
    }

    fseek(f, 0, SEEK_END);
    long pos = ftell(f);

    char line[4096];
    int n = 0;
    size_t len = 0;

    while(pos > 0 && n < count){
        pos--;
        fseek(f, pos, SEEK_SET);

        int c = fgetc(f);
        if(c == '\n'){
            if(len > 0){
                line[len] = '\0';
                reverseString(line);
                printEntry(line, LOG_NUMBERED);
                len = 0;
                n++;
                if(n < count){
                    printf("\n================================================================\n");
                }
            }
        }else if (len < sizeof(line) - 1){
            line[len++] = (char)c;
        }    
    }

    if(len>0 && n < count){
        line[len] = '\0';
        reverseString(line);
        printEntry(line, LOG_NUMBERED);
    }

    printf("\n========================== END OF LOG ==========================\n");
    fclose(f);
}

//~ Reads the logs, bottom to top, 1 at a time
void readLogs(int mode, char* branch){
    char path[1024];

    if(branch == NULL){
        char* head = getHead();
        snprintf(path, sizeof(path), "%s%s.log", LOGS_PATH, head);
    }else{
        snprintf(path, sizeof(path), "%s%s.log", LOGS_PATH, branch);
    }

    FILE* f = fopen(path, "r");
    if(!f){
        printf(LOG_ERROR_MSG_START"Error openning log file"MSG_END);
        printf(LOG_ERROR_MSG_START"Possibly missing log file, non-existent branch, or commit-less branch"MSG_END);
        return;
    }

    fseek(f, 0, SEEK_END);
    long pos = ftell(f);

    char line[4096];
    char conf[16];
    bool cont = true;
    size_t len = 0;

    while(pos > 0 && cont){
        pos--;
        fseek(f, pos, SEEK_SET);

        int c = fgetc(f);
        if(c == '\n'){
            if(len > 0){
                line[len] = '\0';
                reverseString(line);
                printEntry(line, mode);
                len = 0;

                fgets(conf, sizeof(conf), stdin);
                if(conf[0] == 'x' || conf[0] == 'X'){
                    cont = false;
                }
            }
        }else if (len < sizeof(line) - 1){
            line[len++] = (char)c;
        }    
    }

    if(len>0 && cont){
        line[len] = '\0';
        reverseString(line);
        printEntry(line, mode);
    }

    fclose(f);
}

bool logs(int argc, char* argv[]){

    switch(argc){
        //@ chz log
        case (ARG_BASE + 2):
            if(checkChz()){
                readLogs(LOG_NORMAL, NULL);
            }
            break;

        //@ chz log <arg>
        case (ARG_BASE + 3):
            if(strcmp(argv[ARG_BASE + 2], "-h") == 0){
                //% chz log -h
                logHelp();

            }else if(strcmp(argv[ARG_BASE + 2], "-o") == 0){
                //% chz log -o
                readLogs(LOG_SHORT, NULL);      // 6 letter hashes + message

            }else if(strcmp(argv[ARG_BASE + 2], "-r") == 0){
                //% chz log -r
                readLogsReverse();

            }
            break;

        //@ chz log <arg> <arg>
        case (ARG_BASE + 4):
            if(strcmp(argv[ARG_BASE + 2], "-n") == 0){
                //% chz log -n <int>       
                readAmountLogs(atoi(argv[ARG_BASE + 3]));

            }else if(strcmp(argv[ARG_BASE + 2], "-b") == 0){
                //% chz log -b <branch>
                readLogs(LOG_NORMAL, argv[ARG_BASE + 3]);
            }
            break;

        default:
            printf(CHZ_ERROR_MSG_START"Invalid Command"MSG_END);
            break;
    }
}