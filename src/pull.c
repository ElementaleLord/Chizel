#include "../include/chizel.h"
#include "fetch.c"
#include "merge.c"

//~ obviously not finished
//^ B: mf there is nothing

void pull(int argc, char* argv[]){
    
    fetch(argc, argv);
    merge(argc, argv);

}