/**
 * HTTP状态码枚举
 */
export const enum HttpStatusCode {
  // 成功状态码
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,

  // 客户端错误状态码
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  REQUEST_TIMEOUT = 408,
  CONFLICT = 409,

  // 服务器错误状态码
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

/**
 * API响应码枚举
 */
export const enum ApiCode {
  // 成功
  SUCCESS = 200,

  // 通用错误
  ERROR = 500,
  PARAM_ERROR = 400,
  NOT_FOUND = 404,

  // 认证授权错误
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  TOKEN_EXPIRED = 40101,
  TOKEN_INVALID = 40102,

  // 业务错误
  BUSINESS_ERROR = 600,
  DATA_EXIST = 601,
  DATA_NOT_EXIST = 602,
}

/**
 * API错误消息枚举
 */
export const ApiErrorMessage: IObjectBase = {
  // 通用错误
  400: '请求参数错误',
  401: '登录已过期，请重新登录',
  403: '没有权限访问此资源',
  404: '请求的资源不存在',
  500: '服务器内部错误，请稍后重试',
  502: '网关错误，请稍后重试',
  503: '服务器维护中，请稍后重试',
  504: '服务器超时，请稍后重试',

  // 网络错误
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  TIMEOUT_ERROR: '请求超时，请检查网络连接',
  REQUEST_ERROR: '请求配置错误',
  DEFAULT_ERROR: '请求失败',
  NETWORK_CONNECTION_ERROR: '网络连接失败，请检查网络设置',
};
