#include "../include/chzdb.h"
#include "commit.c"
#include <unistd.h>

//& O: for more reliable uploading & restoring, i opted for blobs :>

//~ Compresses raw bytes from memory and returns buffer
int compressBuffer(const unsigned char* data, size_t len, unsigned char** outBuf, size_t* outLen){
    z_stream zs = {0};
    
    // compression init
    if(deflateInit(&zs, Z_BEST_COMPRESSION) != Z_OK){
        return -1;
    }

    size_t cap = 4096;      // buffer capacity
    unsigned char* buf = malloc(cap);       // buffer for data
    if(!buf){
        deflateEnd(&zs);    // cleanup, duh
        return -1;
    }

    // straight from Faust :>
    zs.next_in = (Bytef*) data;     // pointer to next byte to be inputted
    zs.avail_in = len;              // bytes available
    size_t written = 0;             // tracker
    int ret;                        // return value from deflation

    do{
        if(written == cap){
            cap *= 2;
            unsigned char* tmp = realloc(buf, cap);
            if(!tmp){
                free(buf);
                deflateEnd(&zs);
                return -1;
            }
            buf = tmp;
        }

        zs.next_out = buf + written;        // write after produced bytes
        zs.avail_out = cap - written;       // space left

        // might as well not define a whole new var for this
        ret = deflate(&zs, zs.avail_in > 0 ? Z_NO_FLUSH : Z_FINISH);   // compression
        written = cap - zs.avail_out;
    }while(ret != Z_STREAM_END);

    deflateEnd(&zs);
    *outBuf = buf;          // return compressed buffer
    *outLen = written;      // return length of compressed data
    return 1;
}

//~ Reads a file via memory then returns a pointer to it
char* readRaw(const char* path, size_t* fileSize){
    FILE* fptr = fopen(path, "rb");     //! YES I USED RB. WE NEED IT IN BINARY
    if(!fptr){
        return NULL;
    }

    fseek(fptr, 0, SEEK_END);
    long size = ftell(fptr);
    rewind(fptr);

    if(size < 0){
        fclose(fptr);
        return NULL;
    }

    char* buf = malloc(size);
    if(!buf){
        fclose(fptr);
        return NULL;
    }

    size_t bytesRead = fread(buf, 1, size, fptr);
    fclose(fptr);

    if(bytesRead != (size_t)size){      // incase less or more than the actual byte count
        free(buf);
        return NULL;
    }

    *fileSize = bytesRead;
    return buf;
}

int appendBlobFile(const char *relative, int is_dir,
                   const unsigned char *compressed, size_t compressed_len){

    char path[PATH_MAX];
    snprintf(path, sizeof(path), "%s/blobs.pack", PACK_PUSH_PATH);

    FILE *pack = fopen(path, "ab");
    if (!pack){
        return -1;
    }

    Blob hdr;
    hdr.pathLen = strlen(relative);
    hdr.isDir = is_dir;
    hdr.blobLen = hdr.isDir ? 0 : compressed_len;

    if(fwrite(&hdr, sizeof(hdr), 1, pack) != 1){
        fclose(pack);
        return -1;
    }

    if(fwrite(relative, 1, hdr.pathLen, pack) != hdr.pathLen){
        fclose(pack);
        return -1;
    }

    if (!is_dir){
        if(fwrite(compressed, 1, compressed_len, pack) != compressed_len){
            fclose(pack);
            return -1;
        }
    }

    fclose(pack);
    return 1;
}


//~ Recursively walks the dir, uploading subdir metadata and compressing files
int pushPath(const char* root, const char* relative){
    char full_path[PATH_MAX];
    struct stat st;

    if(relative[0] == '\0'){
        snprintf(full_path, sizeof(full_path), "%s", root);
    }else{ 
        snprintf(full_path, sizeof(full_path), "%s/%s", root, relative);
    }

    if(stat(full_path, &st) != 0){
        return -1;
    }

    if(S_ISDIR(st.st_mode)){
        if(relative[0] != '\0'){
            if(appendBlobFile(relative, 1, NULL, 0) != 1){
                return -1;
            }
        }

        DIR* dir = opendir(full_path);
        if(!dir) return -1;

        struct dirent* entry;
        while((entry = readdir(dir)) != NULL){
            if(strcmp(entry->d_name, ".") == 0 || strcmp(entry->d_name, "..") == 0){
                continue;
            }

            char child_rel[PATH_MAX];
            if(relative[0] == '\0'){
                snprintf(child_rel, sizeof(child_rel), "%s", entry->d_name);
            }else{
                snprintf(child_rel, sizeof(child_rel), "%s/%s", relative, entry->d_name);
            }

            if(pushPath(root, child_rel) != 1){
                closedir(dir);
                return -1;
            }
        }

        closedir(dir);
        return 1;
    }

    if(S_ISREG(st.st_mode)){        // is regular file
        size_t file_size;
        char* raw = readRaw(full_path, &file_size);
        if(!raw){ return -1; }

        unsigned char* compressed = NULL;
        size_t compressed_len = 0;

        if(compressBuffer((unsigned char*)raw, file_size, &compressed, &compressed_len) == -1){
            free(raw);
            return -1;
        }

        if(appendBlobFile(relative, 0, compressed, compressed_len) != 1){
            free(raw);
            free(compressed);
            return -1;
        }

        free(raw);
        free(compressed);
        return 1;
    }

    return 1;
}

//~ Starts the compression process
int zipDirectory(){
    char curpath[PATH_MAX];
    if(getcwd(curpath, sizeof(curpath)) == NULL){
        printf(PUSH_REPORT_MSG_START"Could not access workin directory"MSG_END);
        return -1;
    }

    char pack[PATH_MAX];
    snprintf(pack, sizeof(pack), "%s/blobs.pack", PACK_PUSH_PATH);
    FILE *pfile = fopen(pack, "wb");
    if(!pfile){
        return -1;
    }
    fclose(pfile);

    return pushPath(curpath, "");   // "" as in root
}   

void pushHelp(){
    printf(PUSH_REPORT_MSG_START"\nUsage: chz push | chz push -h"MSG_END);
}

int push(int argc, char* argv[]){
    switch(argc){
        //@ chz push
        case ARG_BASE + 2:
            // idk what to do here, the extra identifiers are required :/  backend? 
            break;

        case ARG_BASE + 3:
            if(strcmp(argv[ARG_BASE + 2], "-h") == 0){
                pushHelp();
            } 
            break;

        //@ chz push -i <name> <email>
        case ARG_BASE + 5:
            if(strcmp(argv[ARG_BASE + 2], "-i") == 0){
                if(argv[ARG_BASE + 3] == NULL || argv[ARG_BASE + 4] == NULL){
                    printf(PUSH_ERROR_MSG_START"Error acquiring information"MSG_END);
                    return 0;
                }

                char message[128];
                snprintf(message, 128, "Pushing to %s", getHead());

                char* args[] = {"./commit", "-m", message};
                int count = 3;

                commit(count, args);    // no idea as of currently, how will we implement the name and email
                if(addLogEntry() < 0){
                    return -1;
                }                       // into these, for now it'll stay as local
                
                int zip = zipDirectory();
                if(zip == -1){
                    printf(PUSH_ERROR_MSG_START"Zipping went wrong"MSG_END);
                    return -1;
                }
                
                uploadToDB();
            }
            break;

        default:
            printf(CHZ_ERROR_MSG_START"Invalid Command"MSG_END);
            break;
    }
}

int main(int argc, char* argv[]){
    push(argc, argv);
}