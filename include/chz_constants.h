#ifndef CHZ_CONSTANTS_H
#define CHZ_CONSTANTS_H

//~ indicates the explanation of a near (usually below) function
//! <:> indicates some MAJOR ERROR or some MISSING portion that need be done
//@ indicates important distinctions
//# a comment used to explain the exists of some variables (mainly for P:)
//$ <:> indicates a todo task of some sort (less urgent version of //!)
//% indicates more minor distinctions
//? <:> indicates questions
//^ <:> indicates responses (usually placed under a //?)
//& NOTE-# <:> indicates important NOTES
//*-<:>-indicates-changes-or-REALLY-IMPORTANT-SHIT------------------------------------
/// indicates redacted but still needed comment

/*
also try to respect the "formatting" of each one
if one above has <:> in it use the below keys to id who saying that 
P: is ElementaleLord
O: is Voltro
B: is Cloak
F: is Faust
//& NOTE-1 P: if more that one <:> then only count the first one to the comment
//& NOTE-1 P: others just indicate comment maker taklking to or about someone else
*/

//~ paths
#define CHZ_PATH ".chz"
#define BRANCHES_PATH ".chz/branches"
#define REFS_PATH ".chz/refs"
#define REFS_HEADS_PATH ".chz/refs/heads"
#define REFS_TAGS_PATH ".chz/refs/tags"
#define OBJECTS_PATH ".chz/objects"
#define OBJECTS_INFO_PATH ".chz/objects/info"
#define HOOKS_PATH ".chz/hooks"
#define INFO_PATH ".chz/info"
#define HEAD_PATH ".chz/HEAD"
#define INDEX_PATH ".chz/index"
#define CONFIG_PATH ".chz/config"
#define DESC_PATH ".chz/description"
#define UNPACK_REFS_PATH ".chz/unpacked-refs"

//~ offsets
#define ARG_BASE -1
//# ARG_BASE used for argc & argv equalisation, 
//# since right now we're not using the full command "chz branch", 
//# but rather "./branch" or "./branch.exe", the argument count is less 
//# than if we'd use it later on. Whilst working without "chz" keep it -1,
//# otherwise change to 0
//^ O: B: wrote something entirely different, he's so fucking useless. 
//^ B: hello!👋🐱

//~ permissions
#define DEF_PERM 0700
#define ALL_PERM 0755

//~ autism
#define ERROR_MSG_START "chz ERROR: "

#endif