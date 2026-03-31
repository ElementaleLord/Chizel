#include "../include/chizel.c"
#include <dirent.h>
#include <errno.h>

//DEPENDENCIES
#include <zlib.h>
#include <openssl/sha.h> 
//DEPENDENCIES: INSTALL OPENSSL/ ZLIB
// -lcrypto to compile
//used for SHA1, while not recommended its fast and doesn't use much memory
//future changes might include moving to SHA2 and reworking blob objects

typedef struct
{
    char* name; 
    unsigned int mode;
    unsigned char hash[20];
}blob_object;


#define dynamic_append(d_arr, val)\
    do{\
        if(d_arr.size >= d_arr.capacity)\
        {\
            if(d_arr.size == 0) d_arr.capacity = 256;\
            else d_arr.capacity *= 2;\
            void *temp = realloc(d_arr.content, d_arr.capacity * sizeof(*d_arr.content));\
            if(!temp)\
            {\
                perror("realloc failed");\
                exit(1);\
            }\
            d_arr.content = temp;\
        }\
        d_arr.content[d_arr.size++] = val;\
    }while(0)

int check_chz()
{
    DIR* pdir = opendir(CHZ_PATH);
    if(pdir)
    {
        closedir(pdir);
        return 1;
    }
    //file doesnt exist
    if(errno == ENOENT) return 0;
    //permission error or other issues
    return -1;
}

int check_staging_area()
{
    FILE *f_ptr = fopen(INDEX_PATH, "r");
    if(!f_ptr)
    {
        perror("couldnt access index");
        return 0;
    }

    fclose(f_ptr);
    return 1;
}

int compare_paths(const void* a, const void* b)
{
    const char* path_a = *(const char**) a;
    const char* path_b = *(const char**) b;

    return strcmp(path_a, path_b);
}

Lines read_staging_area()
{
    Lines index_content = {0};
    FILE *f_ptr = fopen(INDEX_PATH, "r");
    char line[256];
    while(fgets(line,sizeof(line), f_ptr))
    {
        dynamic_append(index_content, strdup(line));
    }
    return index_content;
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
        printf("something");
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
void write_chz_object(const char* type, const char* content, size_t len, char* bin_hash)
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
    mkdir(dir_path, 0777); 

    char obj_path[256];
    sprintf(obj_path, "%s/%s", dir_path, hex_hash + 2);

    compression(obj_path, (unsigned int*)full_content, full_len);

    free(full_content);
}

char* read_file_content(char* path, size_t* file_size)
{
    FILE* f_ptr = fopen("path", "rb");
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

    return 0;
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

bool preCommit()
{
    int status = check_chz();
    if(status == 0)
    {
        printf(COMMIT_ERROR_MSG_START".chz workspace not initialized"MSG_END);
        whatIsTheError();
        printf(COMMIT_REPORT_MSG_START"initialize, .chz with chz init before running any chz operations"MSG_END);
        return false;
    }
    else if(status < 0)
    {
        printf(COMMIT_ERROR_MSG_START"failed to access .chz workspace"MSG_END);
        whatIsTheError();
        return false;
    }

    status = check_staging_area();
    if(status == 0)
    {
        printf(COMMIT_ERROR_MSG_START"errorMSG"MSG_END);
        return false;
    }
    else if(status < 0)
    {
        printf(COMMIT_ERROR_MSG_START"failed to access staging area in the workspace"MSG_END);
        whatIsTheError();
        return false;
    }

    Lines index = read_staging_area();
    qsort(index.content, index.size, sizeof(index.content[0]), compare_paths);
    return true;
}

void commitHelp()
{
    printf(COMMIT_REPORT_MSG_START"\nUsage: chz commit -h | chz commit -m \"msg\""MSG_END);
}

void commit(int argc, char* argv[]){
    switch(argc)
    {
        //@ chz commit <arg>
        case ARG_BASE + 3:
            if(strcmp(argv[ARG_BASE + 3], "-h") == 0)
            {//% chz commit -h
                commitHelp();
            }
        //@ chz commit <arg> <arg>
        case ARG_BASE + 4:
            if(strcmp(argv[ARG_BASE + 3], "-m") == 0)
            {//% chz commit -m "message"
                preCommit();
            }
        default:
            printf(CHZ_ERROR_MSG_START"Invalid Command"MSG_END);
            break;
    }
}

int main(int argc, char* argv[])
{
    commit(argc, argv);
    return 0;
}
