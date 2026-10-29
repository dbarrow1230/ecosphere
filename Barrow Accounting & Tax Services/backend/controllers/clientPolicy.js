export const clientScope=({user,canManageAllClients})=>canManageAllClients?{}:{assignedTo:user._id};

export const assignmentFor=(req,creating)=>req.canManageAllClients?(Object.hasOwn(req.body,"assignedTo")?req.body.assignedTo||null:creating?null:undefined):creating?req.user._id:undefined;
