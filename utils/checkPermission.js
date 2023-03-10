import {UnAuthenticatedError } from '../errors/index.js';


const checkPermissions = (requestUser, resourceUserId) => {
  // if (requestUser.role === 'admin') return
  const data =JSON.stringify(resourceUserId);
  if (requestUser.userId != data) return
  throw new UnAuthenticatedError(
    'Not authorized to access this route'

  );
};

export default checkPermissions