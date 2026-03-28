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
void whatIsTheError(){
    printf("Error String: %s.\n", strerror(errno));
}

//~ helper used to check if .chz exists
bool checkChz(){
    DIR* p_dir = opendir(CHZ_PATH);
    
    if(p_dir)
    {
        printf("STATUS REPORT: .chz Directory Already Exists.\n");
        whatIsTheError();
        closedir(p_dir);
        return false;
    }
    
    return true;
}

void status(int argc, char* argv[])
{
    char path[1024];
    DIR* p_dir;
    
}

int main(int argc, char* argv[])
{
    status(argc, argv);

    return 0;
}