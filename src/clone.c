#include "../include/chizel.c"
#include "init.c"
#include "fetch.c"

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
            //% chz clone <link>
            if(checkChz())
            {
                printf(CLONE_ERROR_MSG_START"Cannot Clone An Already Initialised Repository"MSG_END);
                break;
            }else{
                //# do init.c
                preCreateChz();
                //# do fetch.c
                if(fetchFunction(argv[ARG_BASE + 2]) != NULL)   //# FOUND
                {
                    printf(CLONE_REPORT_MSG_START"Successfully Cloned Remote Repository"MSG_END);
                    break;
                }else{
                    printf(CLONE_ERROR_MSG_START"Unable To Locate Remote Repository, Make Sure It Exists Or Is A Chizel Repository"MSG_END);
                    break;
                }
            }
        default:
            printf(CHZ_ERROR_MSG_START"Invalid Command"MSG_END);
            return NULL;
            break;
    }
}

int main(int argc, char* argv[])
{
    clone(argc, argv);
    return 0;
}