#include <stdio.h>
#include <string.h>
#include <stdbool.h>

bool init(void);

int main(int argc, char *argv[]){
    if(argc<2)
    {
        printf("Usage: chz <command>\n");
        return 1;
    }

    if(strcmp(argv[1], "init")==0){
        return init() ? 0 : 1;
    }

    printf("Unknown/Unfinished command: %s\n", argv[1]);
    return 1;
}
//gcc main.c init.c -o chz