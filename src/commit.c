#include "../include/chizel.h"
#include <dirent.h>
#include <sys/stat.h>
#include <zlib.h>
#include <openssl/sha.h>
//DEPENDENCIES: INSTALL OPENSSL/ ZLIB
// -lcrypto for openSSL -lz for zlib

#ifdef _WIN32
#include <direct.h>
#define rmdir(path) _rmdir(path)
#define mkdir(dir) _mkdir(dir)
#endif  

#define ZERO_HASH "0000000000000000000000000000000000000000"
// Environment & Staging
Lines preCommit();

// Path & Hashing Helpers
int compare_paths(const void* a, const void* b);
void get_current_branch_path(char* dst);
int get_parent_hash(char* parent_hex);
int hash_file(const char* path, unsigned char* hash_out);
void hash_to_string(unsigned char* hash, char* dst);
struct tm* get_time();

// Object & File Manipulation
int compression(const char *out_path, const unsigned int *data, size_t len);
void write_chz_object(const char* type, const char* content, size_t len, char* bin_hash);
char* read_file_content(const char* path, size_t* file_size);
unsigned char* build_tree(Lines index, size_t* tree_len);
void create_commit_object(const char* tree_hash, const char* parent_hash, const char* message, char* out_commit_hash);
void update_branch_ref(const char* new_commit_hash);

// CLI Entry Points
void commitHelp();
void commit(int argc, char* argv[]);

int main(int argc, char* argv[]){
    commit(argc, argv);
}

int compare_paths(const void* a, const void* b)
{
    const char* path_a = *(const char**) a;
    const char* path_b = *(const char**) b;

    return strcmp(path_a, path_b);
}

void get_current_branch_path(char* dst)
{
    FILE* f_ptr = fopen(HEAD_PATH, "r");
    if(!f_ptr)
    {
        perror("HEAD not found");
        return;
    }

    if(fscanf(f_ptr, "%s", dst) != 1)
    {
        strcpy(dst, "refs/heads/master");
    }

    return;
}

int get_parent_hash(char* parent_hex)
{
    char branch_ref[256];
    get_current_branch_path(branch_ref);

    char full_path[512];
    sprintf(full_path, "%s/%s", CHZ_PATH, branch_ref);

    FILE* f_ptr = fopen(full_path, "r");
    if (!f_ptr) return 0; 

    if (fscanf(f_ptr, "%40s", parent_hex) != 1)
    {
        strcpy(parent_hex, ZERO_HASH);
        fclose(f_ptr);
        return 0;
    }

    fclose(f_ptr);
    return 1;
}

int hash_file(const char* path,unsigned char* hash_out)
{
    FILE *f_ptr = fopen(path, "rb"); //# rb as edge case for some windows systems
    if(!f_ptr)
    {
        perror("failed to access path file");
        return -1;
    }

    SHA_CTX sha_context;
    SHA1_Init(&sha_context); //# Deprecated due to plans to phase out SHA1 in 2030, works for current 

    char buffer[4096];
    size_t nbRead;

    while((nbRead = fread(buffer,1, sizeof(buffer), f_ptr)))
    {
        SHA1_Update(&sha_context, buffer, nbRead);
    }

    SHA1_Final(hash_out, &sha_context);
    fclose(f_ptr);
    return 1;
}

//~ Zlib over regular compression functions in C due to it being lossless and fast
int compression(const char *out_path, const unsigned int *data, size_t len)
{
    FILE* f_ptr = fopen(out_path, "wb");
    if(!f_ptr)
    {
        perror("compression fail: fopen failure");
        return -1;
    }

    z_stream fin;
    fin.zalloc = Z_NULL;
    fin.zfree = Z_NULL;
    fin.opaque = Z_NULL;

    if(deflateInit(&fin, Z_BEST_COMPRESSION) != Z_OK) return -1;

    fin.next_in = (Bytef *)data;
    fin.avail_in = len;
    
    unsigned char out[4096];
    do
    {
        fin.next_out = out;
        fin.avail_out = sizeof(out);
        deflate(&fin, Z_FINISH);
        size_t nbRead = sizeof(out) - fin.avail_out;
        fwrite(out, 1, nbRead, f_ptr);
    }while(fin.avail_out == 0);

    deflateEnd(&fin);
    fclose(f_ptr);
    return 1;
}

struct tm* get_time()
{
    time_t t = time(NULL);
    return localtime(&t);
}

void hash_to_string(unsigned char* hash, char* dst)
{
    for(int i = 0; i < 20; i++)
    {
        sprintf(dst + (i * 2), "%02x", hash[i]);
    }
    dst[40] = '\0';
}

void write_chz_object( const char* type, const char* content, size_t len, char* bin_hash)
{
    char header[64];
    int header_len = sprintf(header, "%s %zu", type, len) + 1;
    size_t full_len = header_len + len;
    unsigned char* full_content = malloc(full_len);
    
    memcpy(full_content, header, header_len);
    memcpy(full_content + header_len, content, len);

    SHA1(full_content, full_len, bin_hash);

    char hex_hash[41];
    hash_to_string(bin_hash, hex_hash);

    char dir_path[256];
    sprintf(dir_path, "%s/objects/%.2s", CHZ_PATH, hex_hash);
    #ifdef _WIN32
        mkdir(dir_path);
    #else
        mkdir(dir_path, 0777);
    #endif

    char obj_path[512];
    sprintf(obj_path, "%s/%s", dir_path, hex_hash + 2);

    compression(obj_path, (unsigned int*)full_content, full_len);

    free(full_content);
}

void create_commit_object(
        const char* tree_hash, 
        const char* parent_hash, 
        const char* message,
        char* commit_hash
        )
{
    char commit_content[1024];
    int offset = 0;

    offset += sprintf(commit_content + offset, "tree %s\n" , tree_hash);

    if(parent_hash && strlen(parent_hash) > 0)
    {
        offset += sprintf(commit_content + offset, "parent %s\n", parent_hash);
    }
        
    struct tm* time_info = get_time();
    char time_str[64];
    strftime(time_str, sizeof(time_str),"%s %z", time_info);
        
    //temp author and committer fields until I find a good way to dynamically do that
    offset += sprintf(commit_content + offset, "author ChizelUser <user@example.com> %s\n", time_str);
    offset += sprintf(commit_content + offset, "committer ChizelUser <user@example.com> %s\n\n", time_str);
    offset += sprintf(commit_content + offset, "%s\n", message);

    char bin_hash[20];
    write_chz_object("commit", commit_content, offset, bin_hash);
    hash_to_string((unsigned char*) bin_hash, commit_hash);    
}


char* read_file_content(const char* path, size_t* file_size)
{
    FILE* f_ptr = fopen(path, "rb");
    if(!f_ptr)
    {
        perror("Failed in opening the file");
        return NULL;
    }

    fseek(f_ptr, 0,SEEK_END);
    *file_size = ftell(f_ptr);
    rewind(f_ptr);

    char* buffer = malloc(*file_size + 1);
    if(!buffer)
    {
        perror("failed in allocating the memory for the buffer");
        fclose(f_ptr);
        return NULL;
    }
    
    size_t nbRead = fread(buffer, 1, *file_size, f_ptr);
    if(nbRead != *file_size)
    {
        perror("Failed in reading the full file");
        free(buffer);
        fclose(f_ptr);
        return NULL;
    }

    buffer[*file_size] = '\0';
    fclose(f_ptr);

    return buffer;
}

unsigned char* build_tree(Lines index, size_t* tree_len)
{
    size_t capacity = 4096;
    unsigned char* tree_buffer = malloc(capacity);
    if(!tree_buffer)
    {
        perror("Failed To Allocate Tree");
        exit(1);
    }

    size_t offset = 0;
    for(size_t i = 0; i < index.size; i++)
    {
        char* path = index.content[i];
        path[strcspn(path, "\r\n")] = '\0';
        if(strlen(path) == 0) continue;

        size_t  file_size = 0;
        char* file_content = read_file_content(path, &file_size);
        if(!file_content)
        {
            perror("potentially empty file"); //better error message im running on fumes
            continue;
        }

        char bin_hash[20];
        write_chz_object("blob", (const char*) file_content, file_size, bin_hash);
        free(file_content);

        const char* mode = "100644";
        size_t input_len = strlen(mode) + strlen(path) + 1 + 20;

        if(offset + input_len > capacity) 
        {
            capacity *= 2;
            tree_buffer = realloc(tree_buffer, capacity);
        }

        int text_len = sprintf((char*) (tree_buffer + offset), "%s %s", mode, path);
        offset += text_len + 1;

        memcpy(tree_buffer + offset, bin_hash, 20);
        offset += 20;
    }

    *tree_len = offset;
    return tree_buffer;
}

Lines preCommit()
{
    Lines empty_index = {0};
    int status = checkChz();
    if(status == 0)
    {
        printf(COMMIT_ERROR_MSG_START".chz workspace not initialized"MSG_END);
        whatIsTheError();
        printf(COMMIT_REPORT_MSG_START"initialize, .chz with chz init before running any chz operations"MSG_END);
        return empty_index;
    }
    else if(status < 0)
    {
        printf(COMMIT_ERROR_MSG_START"failed to access .chz workspace"MSG_END);
        whatIsTheError();
        return empty_index;
    }

    status = checkStagingArea();
    if(status == 0)
    {
        printf(COMMIT_ERROR_MSG_START"Staging area failure"MSG_END);
        return empty_index;
    }
    else if(status < 0)
    {
        printf(COMMIT_ERROR_MSG_START"failed to access staging area in the workspace"MSG_END);
        whatIsTheError();
        return empty_index;
    }

    Lines index = readStagingArea();
    qsort(index.content, index.size, sizeof(index.content[0]), compare_paths);
    return index;
}

void commitHelp()
{
    printf(COMMIT_REPORT_MSG_START"\nUsage: chz commit -h | chz commit -m <msg>"MSG_END);
}

void commit(int argc, char* argv[])
{
    switch(argc)
    {
        case ARG_BASE + 3:
            if(strcmp(argv[ARG_BASE + 2], "-h") == 0)
            {
                commitHelp();
            }
            break;

        case ARG_BASE + 4:
            if(strcmp(argv[ARG_BASE + 2], "-m") == 0)
            {
                Lines index = preCommit();
                if (index.size == 0 && index.capacity == 0) return; 

                size_t tree_len = 0;
                unsigned char* tree_buffer = build_tree(index, &tree_len);

                char bin_tree_hash[20];
                write_chz_object("tree", (const char*)tree_buffer, tree_len, bin_tree_hash);
                free(tree_buffer); 

                char hex_tree_hash[41];
                hash_to_string((unsigned char*)bin_tree_hash, hex_tree_hash);

                char parent_hash[41] = {0};
                get_parent_hash(parent_hash);

                char commit_hash[41];
                //message arg
                char* commit_message = argv[ARG_BASE + 3]; 
                create_commit_object(hex_tree_hash, parent_hash, commit_message, commit_hash);

                update_branch_ref(commit_hash);

                printf("[master %s] %s\n", commit_hash, commit_message);

                for(size_t i = 0; i < index.size; i++) free(index.content[i]);
                free(index.content);

                addLogEntry();
                zipDirectory(STORE_DATA);
            }
            break;

        default:
            printf(CHZ_ERROR_MSG_START"Invalid Command"MSG_END"\n");
            break;
    }
}

void update_branch_ref(const char* new_commit_hash)
{
    char branch_ref[256];
    get_current_branch_path(branch_ref);
    
    char full_path[512];
    sprintf(full_path, "%s/%s", CHZ_PATH, branch_ref);
    
    FILE* f_ptr = fopen(full_path, "w+");
    if(!f_ptr)
    {
        perror("Failed to update branch ref");
        return;
    }

    fprintf(f_ptr, "%s\n", new_commit_hash);
    fclose(f_ptr);
}

int main(int argc, char* argv[]){
    commit(argc, argv);
    return 0;
}