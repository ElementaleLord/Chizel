#include <stdlib.h>
#include <stdio.h>
#include <dirent.h>
#include <errno.h>
#include <stdbool.h>
#include <string.h>

//seperate both mdkir commands because function overriding doesnt exist in C
#ifdef _WIN32
#include <direct.h>
#define mkdir(dir) _mkdir(dir)
#else
#include <sys/stat.h>
#include <sys/types.h>
#endif

bool init(){


    const char* dir = "test_folder";

    #ifdef _WIN32
        mkdir(dir);
    #else
        mkdir(dir, 0755);
    #endif

    return true;
}

int main(){
    init();
}