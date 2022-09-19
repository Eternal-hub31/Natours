const CatchAsync = require('../Utilities/CATCHASYNC');
const UserModel = require('../Models/UserModel');
const AppError = require('../Utilities/APPERROR');
const factory = require('./HandlerFactory');
const multer = require('multer');
const APPERROR = require('../Utilities/APPERROR');
const sharp = require('sharp');
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new APPERROR('the file is not an image please upload your image', 400),
      false
    );
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.UploadUserImage = upload.single('photo');
exports.ResizeUserImage = CatchAsync(async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

const filterObj = (obj, ...AllowedFeilds) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (AllowedFeilds.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

exports.UpdateMe = CatchAsync(async (req, res, next) => {
  console.log(req.body, req.file);
  //1) Create Error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'this route is not for password updating please user the route /update-password',
        400
      )
    );
  }
  //2) Update User DOCs and filter out unwanted feilds
  const FitleredBody = filterObj(req.body, 'name', 'email');
  if (req.file) {
    FitleredBody.photo = req.file.filename;
  }
  console.log(FitleredBody);
  const updatedUser = await UserModel.findByIdAndUpdate(
    req.user.id,
    FitleredBody,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({
    status: 'success ',
    data: {
      user: updatedUser,
    },
  });
});
exports.deleteMe = CatchAsync(async (req, res, next) => {
  //2) Update User DOCs and filter out unwanted feilds
  const unactiveUser = await UserModel.findByIdAndUpdate(req.user.id, {
    active: false,
  });
  res.status(204).json({
    status: 'success',
    data: {
      user: unactiveUser,
    },
  });
});

exports.CreateUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    Message: 'This method is not yet working !! please use sign up',
  });
};
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.GetAllUsers = factory.getAll(UserModel);
exports.GetUser = factory.getOne(UserModel);
exports.DeleteUser = factory.deleteOne(UserModel);
exports.UpdateUser = factory.updateOne(UserModel);
