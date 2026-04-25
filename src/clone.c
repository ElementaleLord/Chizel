#include "../include/headers/clone.h"
#include "../include/headers/init.h"
#include "../include/headers/fetch.h"

//~ help function
void cloneHelp()
{
    printf(CLONE_REPORT_MSG_START"\nUsage: chz clone <Chizel Repository URL>"MSG_END);
}

//~ main runner function used to determine case and call appropriate function
void clone(int argc, char* argv[])
{   
    switch(argc)
    {
        //@ chz clone
        case(ARG_BASE + 2):    
            //% chz clone
            printf(CLONE_ERROR_MSG_START"Invalid Amount Of Arguments"MSG_END);
            break;
        //@ chz clone <arg>
        case(ARG_BASE + 3):
            //% chz clone -h
            if(strcmp(argv[ARG_BASE + 2], "-h") == 0){
                cloneHelp();
                break;
            }  
            //% chz clone <link>
            if(checkChz())
            {
                printf(CLONE_ERROR_MSG_START"Cannot Clone Into An Already Initialized Repository"MSG_END);
                break;
            }else{
                //# do init.c
                preCreateChz();
                //# do pull.c using fetch porcess and inflating
                restoreFromDB(argv[ARG_BASE + 2]);
                int r = restorePack(".chz/objects/restored/pulled.pack", ".");
                if(r < 0){
                    printf(PULL_ERROR_MSG_START"Could not unpack restored content"MSG_END);
                    return;
                }
                break;
            }
        default:
            printf(CHZ_ERROR_MSG_START"Invalid Command"MSG_END);
            return;
            break;
    }
}