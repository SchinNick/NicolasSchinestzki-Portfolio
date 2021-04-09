export const wait = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export const isDescendant = (parent, child) => {
    if(child == parent){
        return true
    }
    if(child == null){
        return false
    }
    var node = child.parentNode;
    while (node != null) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}