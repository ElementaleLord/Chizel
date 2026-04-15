#include "chizel.h"
#include "commit_methods.h"
#include <stdlib.h>

int parse_object_header(FILE* obj_ptr, CommitObject* out_object) 
{
    size_t BUF_SIZE = 16384; 
    unsigned char* raw_buffer = malloc(BUF_SIZE);
    
    z_stream strm = {0};
    unsigned char in_buf[4096];
    strm.next_in = in_buf;
    strm.avail_in = fread(in_buf, 1, sizeof(in_buf), obj_ptr);
    strm.next_out = raw_buffer;
    strm.avail_out = BUF_SIZE;

    inflateInit(&strm);
    int ret = inflate(&strm, Z_FINISH);
    inflateEnd(&strm);

    if (ret != Z_STREAM_END && ret != Z_OK) {
        free(raw_buffer);
        return -1; 
    }

    char* buffer_ptr = (char*)raw_buffer;

    char* space_ptr = strchr(buffer_ptr, ' ');
    if (!space_ptr) return -1;

    char* null_ptr = strchr(space_ptr, '\0');
    if (!null_ptr) return -1;

    size_t type_len = space_ptr - buffer_ptr;
    out_object->type = malloc(type_len + 1);
    strncpy(out_object->type, buffer_ptr, type_len);
    out_object->type[type_len] = '\0';

    out_object->size = strtoull(space_ptr + 1, NULL, 10);
    out_object->data = (unsigned char*)(null_ptr + 1);


    return 0;
}

int read_commit_header(CommitObject* out_object)
{
    char* path;
    char object_hash[64];
    char object_path[256];

    int status = checkChz();
    if(status == 0)
    {
        printf(COMMIT_ERROR_MSG_START".chz workspace not initialized"MSG_END);
        whatIsTheError();
        printf(COMMIT_REPORT_MSG_START"initialize, .chz with chz init before running any chz operations"MSG_END);
        return -1;
    }
    else if(status < 0)
    {
        printf(COMMIT_ERROR_MSG_START"failed to access .chz workspace"MSG_END);
        whatIsTheError();
        return -1;
    }

    FILE* f_ptr = fopen(HEAD_PATH, "r");
    if(!f_ptr)
    {
        perror("Failed in opening HEAD");
        return -1;
    }

    if(!fgets(object_path,sizeof(object_path), f_ptr))
    {
        perror("Failed to read from HEAD");
        return -1;
    }
    fclose(f_ptr);
    object_path[strcspn(object_path, "\r\n")] = 0;
    FILE* hash_ptr = fopen(object_path, "r");
    if(!hash_ptr)
    {
        perror("Failed to read from branch head ref");
        return -1;
    }

    char buffer[64];
    if(!fgets(buffer, sizeof(buffer), hash_ptr))
    {
        perror("Failed to read commit hash");
        return -1;
    }

    char object_dir[8];
    char full_path[256];
    if(sscanf(buffer, "%63s", object_hash) == 1)
    {
        sprintf(object_dir, "%.2s", object_hash);
        sprintf(object_path, "%s", object_hash + 2);
        sprintf(full_path, "%s/%s/%s", OBJECTS_PATH, object_dir, object_path);
    }
}

