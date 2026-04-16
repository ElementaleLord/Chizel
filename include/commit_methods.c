#include "chizel.h"
#include "commit_methods.h"
#include <stdlib.h>

int load_commit_object(FILE* obj_ptr, CommitObject* out_commit) 
{
    size_t BUF_SIZE = 16384; 
    unsigned char* raw_buffer = malloc(BUF_SIZE);
    if (!raw_buffer) return -1;
    
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

    memset(out_commit, 0, sizeof(CommitObject));

    char* buffer_ptr = (char*)raw_buffer;
    char* null_ptr = strchr(buffer_ptr, '\0');
    if (!null_ptr) {
        free(raw_buffer);
        return -1;
    }
    
    char* payload = null_ptr + 1;

    char* line = payload;
    while (line && *line != '\0') {
        
        if (*line == '\n') {
            size_t msg_len = strlen(line + 1);
            out_commit->message = malloc(msg_len + 1);
            strcpy(out_commit->message, line + 1);
            break; 
        }

        char* next_line = strchr(line, '\n');
        if (next_line) {
            *next_line = '\0'; 
        }

        if (strncmp(line, "tree ", 5) == 0) {
            strncpy(out_commit->tree_hash, line + 5, 64);
        }
        else if (strncmp(line, "parent ", 7) == 0) {
            strncpy(out_commit->parent_hash, line + 7, 64);
        }
        else if (strncmp(line, "author ", 7) == 0) {
            char* email_end = strchr(line, '>');
            if (email_end) {
                size_t author_len = email_end - (line + 7) + 1;
                out_commit->author = malloc(author_len + 1);
                strncpy(out_commit->author, line + 7, author_len);
                out_commit->author[author_len] = '\0';
                
                out_commit->commit_date = (time_t)strtol(email_end + 2, NULL, 10);
            }
        }

        if (next_line) {
            line = next_line + 1;
        } else {
            break;
        }
    }

    free(raw_buffer);
    return 1;
}

void walk_history(const char* start_hash) 
{
    char current_hash[65];
    strncpy(current_hash, start_hash, 64);
    current_hash[64] = '\0';

    while (strlen(current_hash) > 0) 
    {
        char obj_path[512];
        snprintf(
                obj_path, 
                sizeof(obj_path), 
                "%s/%.2s/%s", 
                 OBJECTS_PATH, 
                 current_hash, 
                 current_hash + 2
                 );

        FILE* obj_ptr = fopen(obj_path, "rb");
        if (!obj_ptr) break; 

        CommitObject commit;
        if (load_commit_object(obj_ptr, &commit) > 0) 
        {
            printf("commit %s\n", current_hash);
            printf("Author: %s\n", commit.author);
            printf("Date:   %s", ctime(&commit.commit_date));
            printf("\n    %s\n\n", commit.message);

            strncpy(current_hash, commit.parent_hash, 64);
            
            if (commit.author) free(commit.author);
            if (commit.message) free(commit.message);
        }

        fclose(obj_ptr);
        
        if (current_hash[0] == '\0') break;
    }
}

int get_object_path(char* out_path)
{
    char object_hash[64];
    char branch_path[256]; 

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

    if(!fgets(branch_path, sizeof(branch_path), f_ptr))
    {
        perror("Failed to read from HEAD");
        fclose(f_ptr); 
        return -1;
    }
    fclose(f_ptr);
    
    branch_path[strcspn(branch_path, "\r\n")] = 0;
    
    FILE* hash_ptr = fopen(branch_path, "r");
    if(!hash_ptr)
    {
        perror("Failed to read from branch head ref");
        return -1;
    }

    if(!fgets(object_hash, sizeof(object_hash), hash_ptr))
    {
        perror("Failed to read commit hash");
        fclose(hash_ptr); 
        return -1;
    }
    fclose(hash_ptr);

    object_hash[strcspn(object_hash, "\r\n")] = 0;
    snprintf(out_path, 256, "%s/%.2s/%s", OBJECTS_PATH, object_hash, object_hash + 2);

    return 1;
}
