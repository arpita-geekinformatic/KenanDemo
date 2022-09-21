const EMAIL_REQUIRED = 'البريد الإلكتروني مطلوب'; 
const USER_EXISTS = 'المستخدم  موجود من قبل';    
const USER_NOT_FOUND = 'المستخدم غير موجود';  
const PASSWORD_REQUIRED = 'كلمة المرور مطلوبة';  
const NEW_PASSWORD_REQUIRED = 'كلمة المرور الجديدة مطلوبة';    
const INVALID_PASSWORD = 'كلمة المرور غير صالحة'; 
const ACTIVATION_MAIL_SENT = 'أرسلنا لك بريد إلكتروني لتفعيل حسابك';
const INACTIVE_ACCOUNT = 'للأسف ما اتفعل حسابك عندنا، نرجو منك فعل حسابك';   
const TOKEN_REQUIRED = 'رمز المستخدم مطلوب';
const INVALID_TOKEN = 'رمز غير صالح';
const SUCCESS = 'نجح';                   
const OTP_REQUIRED = 'الرجاء إدخال رمز (OTP)';
const INVALID_OTP = 'رمز (OTP)  المدخل غير صالح';
const OTP_EXPIRED = 'انتهت صلاحية كلمة المرور لمرة واحدة  (OTP)';
const OTP_VERIFIED = 'تم التحقق بنجاح من كلمة المرور لمرة واحدة  (OTP)';
const KID_NAME_REQUIRED = 'مطلوب اسم الطفل';
const KID_ADDED = 'أضيف الطفل بنجاح';
const KID_EXISTS = 'طفل موجود بالفعل';
const CHILD_ID_REQUIRED = 'مطلوب معرف (ID) الطفل';
const INVALID_CHILD_ID = 'معرف  (ID) الطفل غير صالح';
const REQUIRE_CHILD_DEVICE_ID = 'مطلوب معرف  (ID)  جهاز الطفل';
const PARENT_ID_REQUIRED = 'مطلوب معرف  (ID) المربي';
const INVALID_DEVICE_ID = 'معرف (ID) الجهاز غير صالح';
const REQUIRE_FCM = 'مطلوب رمز (Fcm)';
const INVALID_PARENT_ID = 'معرف (ID) المربي غير صالح';
const REQUIRE_PACKAGE_NAME = 'مطلوب اسم الحزمة';
const REQUIRE_APP_STATUS = 'حالة التطبيق مطلوبة';
const REQUIRE_SCHEDULE = 'مطلوب جدول التطبيق';
const APP_USAGE_UPDATED = 'تم تحديث استخدام التطبيق بنجاح';
const GIFT_NAME_REQUIRED = 'مطلوب اسم الهدية';
const GIFT_ICON_REQUIRED = 'مطلوب رمز الهدية';
const GIFT_TYPE_REQUIRED = 'مطلوب نوع الهدية';
const POINTS_REQUIRED = 'مطلوب النقاط';
const GIFT_ADDED_SUCCESSFULLY = 'اضيفت الهدية بنجاح';
const GIFT_ID_REQUIRED = 'مطلوب معرف (ID) الهدية';
const GIFT_DELETED_SUCCESSFULLY = 'حذفت الهدية بنجاح';
const LOGOUT = 'تم تسجيل الخروج بنجاح';
const USER_ID_REQUIRED = 'مطلوب معرف (ID) المستخدم';
const TYPE_IS_REQUIRED = 'مطلوب النوع';
const TIME_SPENT_REQUIRED = 'مطلوب الوقت المستغرق';
const START_TIME_REQUIRED = 'المطلوب وقت البدء';
const END_TIME_REQUIRED = 'مطلوب وقت الانتهاء';
const NOTIFICATION_ID_REQUIRED = 'معرف (ID) الإشعار';
const PROFILE_UPDATED = 'تم تحديث الملف الشخصي بنجاح';
const LANGUAGE_REQUIRED = 'مطلوب اللغة';
const SOMETHING_WRONG = 'حدث خطاء، يرجى المحاولة فى وقت لاحق';
const GIFT_ID_INVALID = 'معرف (ID) الهدية غير صالح';
const NOT_ENOUGH_POINTs = 'ليس لديك نقاط كافية للحصول على هذه الهدية';
const ACCEPT_STATUS_REQUIRED = 'مطلوب الحالة مقبولة/ مرفوضة';
const GIFT_REJECTED = 'تم رفض هذا الطلب مسبقاً';
const GIFT_ACCEPTED = 'تم قبول هذا الطلب مسبقاً';
const GIFT_REJECTED_SUCCESSFULLY  = 'تم رفض الطلب بنجاح';
const GIFT_ACCEPTED_SUCCESSFULLY  = 'تم قبول الطلب بنجاح';
const MAX_CHILD_REACHED = 'لقد قمت بالفعل بإضافة الحد الأقصى لملف تعريف الطفل الذي حدده المسؤول.';
const APP_TIME_WARNING = 'لا يمكن أن يكون الوقت المجدول لجميع التطبيقات أكثر من وقت الجهاز.';
const SELECT_DEVICE_USAGE = 'أضف استخدام الجهاز قبل إضافة استخدام التطبيق.';
const MAX_GIFT_EXCEED = 'لا يمكنك إضافة أكثر من 6 هدايا حتى يقوم الطفل باسترداد أي هدية.';
const RESET_PASSWORD_INVALID = 'أعد تعيين كلمة المرور من حساب Google الخاص بك.';


const TOKEN_EXPIRED = 'انتهت صلاحية الرمز (Token)';
const UNAUTHORIZED = 'غير مصرح';
const APP_UNINSTALLED = 'حذف التطبيق مسبقاً من قبل الطفل';
const INVALID_FCM = 'رمز (fcm) غير صالح';

module.exports = {
  EMAIL_REQUIRED,
  USER_EXISTS,
  USER_NOT_FOUND,
  PASSWORD_REQUIRED,
  NEW_PASSWORD_REQUIRED,
  INVALID_PASSWORD,
  ACTIVATION_MAIL_SENT,
  INACTIVE_ACCOUNT,
  TOKEN_REQUIRED,
  INVALID_TOKEN,
  SUCCESS,
  OTP_REQUIRED,
  INVALID_OTP,
  OTP_EXPIRED,
  OTP_VERIFIED,
  KID_NAME_REQUIRED,
  KID_ADDED,
  KID_EXISTS,
  CHILD_ID_REQUIRED,
  INVALID_CHILD_ID,
  REQUIRE_CHILD_DEVICE_ID,
  PARENT_ID_REQUIRED,
  INVALID_DEVICE_ID,
  REQUIRE_FCM,
  INVALID_PARENT_ID,
  REQUIRE_PACKAGE_NAME,
  REQUIRE_APP_STATUS,
  REQUIRE_SCHEDULE,
  APP_USAGE_UPDATED,
  GIFT_NAME_REQUIRED,
  GIFT_ICON_REQUIRED,
  GIFT_TYPE_REQUIRED,
  POINTS_REQUIRED,
  GIFT_ADDED_SUCCESSFULLY,
  GIFT_ID_REQUIRED,
  GIFT_DELETED_SUCCESSFULLY,
  LOGOUT,
  USER_ID_REQUIRED,
  TYPE_IS_REQUIRED,
  TIME_SPENT_REQUIRED,
  START_TIME_REQUIRED,
  END_TIME_REQUIRED,
  NOTIFICATION_ID_REQUIRED,
  PROFILE_UPDATED,
  LANGUAGE_REQUIRED,
  SOMETHING_WRONG,
  GIFT_ID_INVALID,
  NOT_ENOUGH_POINTs,
  ACCEPT_STATUS_REQUIRED,
  GIFT_REJECTED,
  GIFT_ACCEPTED,
  GIFT_REJECTED_SUCCESSFULLY,
  GIFT_ACCEPTED_SUCCESSFULLY,
  MAX_CHILD_REACHED,
  APP_TIME_WARNING,
  SELECT_DEVICE_USAGE,
  MAX_GIFT_EXCEED,
  RESET_PASSWORD_INVALID,
  
  
  TOKEN_EXPIRED,
  UNAUTHORIZED,
  APP_UNINSTALLED,
  INVALID_FCM,
};
