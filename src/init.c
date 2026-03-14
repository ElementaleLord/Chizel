#include <stdlib.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <stdio.h>
#include <dirent.h>
#include <errno.h>
#include <stdbool.h>
#include <string.h>

//! Error Handling required

bool init(){
    struct dirent *de;  // Pointer for directory entry

    DIR *dr = opendir(".");
    bool chzfnd = false;        // 1 = true, 0 = false

    if (dr == NULL){
        printf("Directory Open Error");
        exit(1);
    }

    // Refer https://pubs.opengroup.org/onlinepubs/7990989775/xsh/readdir.html
    while ((de = readdir(dr)) != NULL){
        if(de->d_type == 4 && strcmp(de->d_name, ".chz") == 0){  // d_type: 4 = DIR
            chzfnd = true;
        }
    }

    if(chzfnd == 0){
        if(mkdir("./.chz", 0700) == -1){
            printf("Directiry Init Fault\n");
            return false;
        }else{
            printf("Chizel directory created\n");
        }
    }else{
        printf("Chizel directory exits.\n");
        return false;
    }


    //! hella error handling needed 

    mkdir(".chz/info", 0700);
    fopen(".chz/info/exclude", "w");

    mkdir(".chz/hooks", 0700);
    mkdir(".chz/branches", 0700);
    
    mkdir(".chz/objects", 0700);
    mkdir(".chz/objects/info", 0700);
    mkdir(".chz/objects/pack", 0700);

    mkdir(".chz/refs", 0700);
    mkdir(".chz/refs/heads", 0700);
    mkdir(".chz/refs/tags", 0700);

    fopen(".chz/config", "w");
    fopen(".chz/HEAD", "w");
    fopen(".chz/description", "w");
    

    closedir(dr);
    return true;
}

int main(){
    if(init()==1){
        //printf("Init Success");
    }else{
        //printf("Init Failure");
    }
}