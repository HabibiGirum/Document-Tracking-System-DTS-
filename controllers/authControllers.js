import User from '../models/User.js'
import {
    StatusCodes
} from 'http-status-codes';
import {BadRequestError,UnAuthenticatedError} from '../errors/index.js'

const register=async(req,res)=>{

  const { name, email, password, roll,department } = (req.body)
  console.log(req.body)

    if(!name || !email || !password || !roll || !department){
        throw new BadRequestError('please provide all value')
    }
  // const isPasswordCorrect = await user.comparePassword(password);

    const userAlreadyExist=await User.findOne({email})

    if(userAlreadyExist){
        throw new BadRequestError("Email Already Exist, try on another Email!!! ")
    }
    
  const user = await User.create({ name, email, password, roll,department });
  console.log(user)
        const token = user.createJWT()
        res.status(StatusCodes.CREATED).json({
          user: {
            name: user.name,
            lastName: user.lastName,
            department: user.department,
            email: user.email,
            roll: user.roll,
          },
          token,
          roll: user.roll,
        });

}

const login=async(req,res)=>{
    const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError('Please provide all values');
  }
  const user = await User.findOne({email}).select('+password')
  console.log(user);

  if (!user) {
    throw new UnAuthenticatedError('Invalid Credentials');
  }

  console.log(user);
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnAuthenticatedError('Invalid Credentials');
  }
  if (user) {
      const token = user.createJWT();
      user.password = undefined;
    res
      .status(StatusCodes.OK)
      .json({ user, token, roll: user.roll });
  }


  res.send('login user')
}

const updateUser = async (req, res) => {
  const { email, name, lastName, department, password, newPassword } = req.body;
  console.log(req.body);
  // if (!email || !name || !lastName || !department || !password) {
  //   throw new BadRequestError("Please provide all values");
  // }

  const user = await User.findOne({ _id: req.user.userId });

  user.email = email;
  user.name = name;
  user.lastName = lastName;
  user.department = department;
  if (newPassword !== password) {
    user.password = newPassword;
  }

  await user.save();

  const token = user.createJWT();
  res.status(StatusCodes.OK).json({
    user,
    token,
    department: user.department,
  });
};
export{register,login,updateUser}