function removeUser(userID, chatUsers){
    return chatUsers.filter((user)=>user.id!=userID);
}

module.exports = removeUser;