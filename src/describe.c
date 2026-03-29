#include <stdlib.h>
#include <stdio.h>
#include <dirent.h>
#include <errno.h>
#include <stdbool.h>
#include <string.h>
#include <sys/stat.h>
#include <cjson/cJSON.h>

//# two dots to go up a dir
#include "../include/init_template.h"
#include "../include/chz_constants.h"

#ifdef _WIN32
#include <direct.h>
#define rmdir(path) _rmdir(path)
#define mkdir(dir) _mkdir(dir)
#else
#include <unistd.h>
#include <sys/types.h>
#endif

//~ helper used to print a string representation of the current error number
void whatIsTheError()
{
    printf("Error String: %s.\n", strerror(errno));
}

//~ helper used to check if .chz exists
bool checkChz()
{
    DIR* p_dir = opendir(CHZ_PATH);
    
    if(!p_dir)
    {
        printf("STATUS ERROR: .chz Directory Does Not Exists.\n");
        whatIsTheError();
        return false;
    }
    
    closedir(p_dir);
    return true;
}

//~ helper used to check if tag exists
bool checkTag(char* tagName){
    //# checks if a tag named tagName exists if so return true otherwise false
}

//~ helper used to do exactly as its called
void getNumberToAndIdOfLastCommitFromTag(char* tagName, int* num, char* latestCommitId){
    //# gets the number of commits between given tagName and the lastestCommit on that line
    //# also gets the latestCommit Id/hash value as a string
}

//~ function used as interface to call needed functions
void doDescribe(char* tagName)
{
    if (checkChz())
    {
        if (checkTag(tagName))
        {
            int num;
            char* latestCommitId;
            getNumberToAndIdOfLastCommitFromTag(tagName, &num, latestCommitId);
            printf("%s.%d.%s",tagName, num, latestCommitId);
        }
        else
        {
            printf("DESCRIBE ERROR: Tag %s Does Not Exits.\n", tagName);
        }

    }
}

//~ helper used to display help menu
void describeHelp(){
    printf("DESCRIBE REPORT:\nUsage: chz describe, chz describe <tag-name>.\n");
}

void describe(int argc, char* argv[])
{
    char path[1024];
    DIR* p_dir;
    
    switch(argc){
        //@ chz describe
        case ARG_BASE + 2:
            break;
        //@ chz describe <arg>
        case ARG_BASE + 3:
            if(strcmp(argv[ARG_BASE + 2], "-h") == 0)
            {//% chz describe -h
                describeHelp();
            }
            else
            {//% chz describe <tag-name>
                doCheckout(argv[ARG_BASE + 3]);
            }
            break;
        default:
            break;
    }
    close(p_dir);
}

int main(int argc, char* argv[])
{
    describe(argc, argv);

    return 0;
}