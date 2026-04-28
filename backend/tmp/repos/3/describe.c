#include "../include/chizel.h"
#include <dirent.h>

#ifdef _WIN32
#include <direct.h>
#define rmdir(path) _rmdir(path)
#define mkdir(dir) _mkdir(dir)
#endif

//~ helper used to check if tag exists
bool checkTag(char* tagName)
{
    //# checks if a tag named tagName exists if so return true otherwise false
}

//~ helper used to do exactly as its called
void getNumberToAndIdOfLastCommitFromGivenTag(char* tagName, int* num, char* latestCommitId)
{
    //# gets the number of commits between given tagName and the lastestCommit on that line
    //# also gets the latestCommit Id/hash value as a string
}

//~ function used as interface to call needed functions
void preDescribe(char* tagName)
{
    if (checkChz())
    {
        if (checkTag(tagName))
        {
            int num;
            char* latestCommitId;
            getNumberToAndIdOfLastCommitFromGivenTag(tagName, &num, latestCommitId);
            printf("%s.%d.%s",tagName, num, latestCommitId);
        }
        else  printf(DESCRIBE_ERROR_MSG_START"Tag %s Does Not Exits"MSG_END, tagName);
    }
}
void preCurrentDescribe()
{
    //# calls preDescribe but with the current branch as the "tag"
}

//~ helper used to display help menu
void describeHelp()
{
    printf(DESCRIBE_REPORT_MSG_START"\nUsage: chz describe, chz describe <tag-name>"MSG_END);
}

void describe(int argc, char* argv[])
{
    char path[1024];
    DIR* p_dir;
    
    switch(argc)
    {
        //@ chz describe
        case ARG_BASE + 2:
            preCurrentDescribe();
            break;
        //@ chz describe <arg>
        case ARG_BASE + 3:
            if(strcmp(argv[ARG_BASE + 2], "-h") == 0)
            {//% chz describe -h
                describeHelp();
            }
            else
            {//% chz describe <tag-name>
                preDescribe(argv[ARG_BASE + 3]);
            }
            break;
        default:
            printf(CHZ_ERROR_MSG_START"Invalid Command"MSG_END);
            break;
    }
    close(p_dir);
}

int main(int argc, char* argv[])
{
    describe(argc, argv);

    return 0;
}