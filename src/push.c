#include "../include/chzdb.h"
#include "../include/chizel.h"
#include "commit.c"
#include <unistd.h>

void pushHelp()
{
    printf(PUSH_REPORT_MSG_START "\nUsage: chz push | chz push -h" MSG_END);
}

int push(int argc, char *argv[])
{
    switch (argc)
    {
    //@ chz push
    case ARG_BASE + 2:
        // idk what to do here, the extra identifiers are required :/  backend?
        break;

    case ARG_BASE + 3:
        if (strcmp(argv[ARG_BASE + 2], "-h") == 0)
        {
            pushHelp();
        }
        break;

    //@ chz push -i <name> <email>
    case ARG_BASE + 5:
        if (strcmp(argv[ARG_BASE + 2], "-i") == 0)
        {
            if (argv[ARG_BASE + 3] == NULL || argv[ARG_BASE + 4] == NULL)
            {
                printf(PUSH_ERROR_MSG_START "Error acquiring information" MSG_END);
                return 0;
            }

            char message[128];
            snprintf(message, 128, "Pushing to %s", getHead());

            char* args[] = {"./commit", "-m", message};
            int count = 3;

            commit(count, args);
            if(addLogEntry() < 0){
                return -1;
            }

            int zip = zipDirectory(CHZ_PUSH);
            if(zip == -1){
                printf(PUSH_ERROR_MSG_START"Zipping went wrong"MSG_END);
                return -1;
            }

            uploadToDB();
            
        }
        break;

    default:
        printf(CHZ_ERROR_MSG_START "Invalid Command" MSG_END);
        break;
    }
}

int main(int argc, char *argv[])
{
    push(argc, argv);
}