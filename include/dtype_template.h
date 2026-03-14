#ifndef DTYPE_TEMPLATE_H
#define DTYPE_TEMPLATE_H

#include <time.h>
#include <string.h>
#include <stdbool.h>

struct StatusFile;
struct DateFile;
struct PullRequestType;
struct AccountChz;
struct CommitChz;
struct LightTag;
struct HeavyTag;
struct RepositoryChz;
struct BranchChz;
struct RepositoryLogEntry;
struct RepoFork;
struct PullRequest;

typedef enum FileStatus FileStatus;
typedef enum AuthenticationMethod AuthenticationMethod;
typedef enum ActionType ActionType;
typedef enum PullRequestCategory PullRequestCategory;
typedef enum PullRequestStatus PullRequestStatus;

typedef struct StatusFile StatusFile;
typedef struct DateFile DateFile;
typedef struct PullRequestType PullRequestType;
typedef struct AccountChz AccountChz;
typedef struct CommitChz CommitChz;
typedef struct LightTag LightTag;
typedef struct HeavyTag HeavyTag;
typedef struct RepositoryChz RepositoryChz;
typedef struct BranchChz BranchChz;
typedef struct RepositoryLogEntry RepositoryLogEntry;
typedef struct RepoFork RepoFork;
typedef struct PullRequest PullRequest;

enum FileStatus
{
    MODIFIED, 
    UNMODIFIED, 
    REMOVED, 
    ADDED
};

enum AuthenticationMethod
{
    SECONDARY_EMAIL, 
    PHONE_NUMBER, 
    AUTHENTICATOR_APP
};

enum ActionType
{
    CREATE, 
    DELETE, 
    VIEW
};

enum PullRequestCategory
{
    OPEN, 
    CLOSED
};

enum PullRequestStatus
{
    ACCEPTED, 
    REJECTED, 
    APPLIED, 
    NUL
};

struct StatusFile
{// a file with a status attached
    FileStatus status;
    char* FileName;
};

struct DateFile
{// a file with a date attached
    time_t date;
    long* fileObj;
};

struct PullRequestType
{// used to track the category and status of a pull request
    PullRequestCategory pullReqCat;
    PullRequestStatus pullReqStatus;
};

struct AccountChz
{//? Account Settings Data Type
    char* email;
    long password;// should be a hashed ref
    char* username;
    bool twoFactorAuth;
    AuthenticationMethod method;
};

struct CommitChz
{// General data type for a Commit
    char* commitName;
    char* commitMsg;
    time_t commitDate;
    BranchChz* commitBranch;
    BranchChz* mergeBranch;
    StatusFile* commitedChanges;
};

struct LightTag
{// defines a name and points to some commit
    char* label;
    CommitChz* commitPtr;
};

struct HeavyTag
{// expansion on light tag that additionally track date and user which created this tag
    char* label;
    CommitChz* commitPtr;
    AccountChz* creater;
    time_t HTagDate;
    char* HTagMsg;
};

struct RepositoryChz
{// General data type for a Repository
    char* repoName;
    time_t repoDate;
    char* repoURL;
    long icon;
    //RepositoryLogEntry* repoLog;// array of log entries (i think we defined this to make git log easier to code? maybe)
    LightTag* ptrMap;// array of light tags
    HeavyTag* tagMap;// array of heavy tags
    BranchChz** branches;// array of branch pointers
};

struct BranchChz
{// General data type for a Branch
    char* branchName;
    time_t branchDate;
    DateFile* branchData;
    RepositoryChz* parentRepo;
    CommitChz* latestCommit;
};


struct RepositoryLogEntry
{// used as one entry in a repositories history log
    time_t logEntrydate;
    CommitChz* RepLogData;
};

struct RepoFork
{// defines the extra data needed by a forked repository
    char* originalURL;
    time_t forkDate;
    long vNum;
};

struct PullRequest
{// General data type for a  PullRequest
    char* pullRequestName;
    char* pullRequestMsg;
    time_t createDate;
    time_t submitDate;
    time_t resolveDate;
    PullRequestType status;
};

#endif
