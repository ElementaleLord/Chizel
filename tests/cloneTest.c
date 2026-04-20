#include "../include/chizel.h"
#include "../include/chzdb.h"
#include <sys/stat.h>

int main(int argc, char* argv[]){
    //preCreateChz();
    const char* path = ".chz/objects/restored";
    mkdir(".chz", DEF_PERM);
    mkdir(".chz/objects", DEF_PERM);
    int res = mkdir(path, DEF_PERM);
    if(res != 0){
        printf("failed to create\n");
    }

    restoreFromDB(argv[ARG_BASE + 2]);
    int r = restorePack(".chz/objects/restored/pulled.pack", ".chz/");

    if(r < 0){
        printf(PULL_ERROR_MSG_START"Could not unpack restored content"MSG_END);
        return -1;
    }
}