import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  AxiosError,
} from 'axios';
import { ref } from 'vue';
import { Toast } from 'vant';
import { HttpStatusCode, ApiCode, ApiErrorMessage } from '../enums/HttpEnum';

// 定义请求响应的通用接口
interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
  success: boolean;
}
const baseURL = import.meta.env.VITE_API_BASE_URL as unknown as string;

// 定义HTTP请求选项接口
type HttpOptions = AxiosRequestConfig & { notify?: boolean };
// 存储取消请求的控制器，key为请求URL
const cancels: IObjectBase = {};
/**
 * HTTP请求Hook
 * 提供统一的axios请求封装
 */
export function useHttp() {
  // 加载状态
  const loading = ref(false);

  // 创建axios实例
  const axiosInstance: AxiosInstance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截器
  axiosInstance.interceptors.request.use(
    (config) => {
      const store = useAppStore();
      // 设置加载状态
      loading.value = true;

      // 可以在这里添加token等认证信息
      const token = store.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      config.headers['lang'] = 'zh-CN';
      const url = config.url || +new Date();
      if (config.signal) {
        cancels[url]?.abort();

        const abort = new AbortController();
        cancels[url] = abort;
        config.signal = abort.signal;
      }
      return config;
    },
    (error: AxiosError) => {
      loading.value = false;
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      loading.value = false;

      const res = response.data;

      // 统一处理响应
      if (res.code !== ApiCode.SUCCESS) {
        // 显示错误提示
        Toast.fail(res.msg || ApiErrorMessage.DEFAULT_ERROR);
        console.error('请求失败:', res.msg);
        return Promise.reject(
          new Error(res.msg || ApiErrorMessage.DEFAULT_ERROR)
        );
      }

      return res;
    },
    (error: AxiosError<ApiResponse>) => {
      loading.value = false;

      // 统一处理网络错误
      let errorMessage = '网络错误';

      if (error.response) {
        // 服务器返回了错误响应
        const status = error.response.status;
        const data = error.response.data;
        errorMessage = data?.msg || ApiErrorMessage[status as HttpStatusCode];
      } else if (error.request) {
        // 请求已发送但没有收到响应
        if (error.code === 'ECONNABORTED') {
          errorMessage = ApiErrorMessage.TIMEOUT_ERROR;
        } else {
          errorMessage = ApiErrorMessage.NETWORK_CONNECTION_ERROR;
        }
      } else {
        // 请求配置错误
        errorMessage = error.message || ApiErrorMessage.REQUEST_ERROR;
      }

      // 显示错误提示
      Toast.fail(errorMessage);
      console.error('网络错误:', errorMessage, error);

      return Promise.reject(new Error(errorMessage));
    }
  );

  // GET请求
  const get = async <T = any>(
    url: string,
    options?: HttpOptions
  ): Promise<ApiResponse<T>> => {
    const res = await axiosInstance.get<ApiResponse<T>>(url, options);
    return res.data;
  };

  // POST请求
  const post = async <T = any>(
    url: string,
    data?: any,
    options?: HttpOptions
  ): Promise<ApiResponse<T>> => {
    const res = await axiosInstance.post<ApiResponse<T>>(url, data, options);
    return res.data;
  };
  // POSTFORM请求
  const postForm = async <T = any>(
    url: string,
    data?: any,
    options?: HttpOptions
  ): Promise<ApiResponse<T>> => {
    const res = await axiosInstance.post<ApiResponse<T>>(url, data, {
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      },
      ...options,
    });
    return res.data;
  };
  // PUT请求
  const put = async <T = any>(
    url: string,
    data?: any,
    options?: HttpOptions
  ): Promise<ApiResponse<T>> => {
    const res = await axiosInstance.put<ApiResponse<T>>(url, data, options);
    return res.data;
  };
  // PUTFORM请求
  const putForm = async <T = any>(
    url: string,
    data?: any,
    options?: HttpOptions
  ): Promise<ApiResponse<T>> => {
    const res = await axiosInstance.put<ApiResponse<T>>(url, data, {
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      },
      ...options,
    });
    return res.data;
  };
  // DELETE请求
  const del = async <T = any>(
    url: string,
    options?: HttpOptions
  ): Promise<ApiResponse<T>> => {
    const res = await axiosInstance.delete<ApiResponse<T>>(url, options);
    return res.data;
  };
  // DELETEFORM请求
  const delForm = async <T = any>(
    url: string,
    options?: HttpOptions
  ): Promise<ApiResponse<T>> => {
    const res = await axiosInstance.delete<ApiResponse<T>>(url, {
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      },
      ...options,
    });
    return res.data;
  };
  // PATCH请求
  const patch = async <T = any>(
    url: string,
    data?: any,
    options?: HttpOptions
  ): Promise<ApiResponse<T>> => {
    const res = await axiosInstance.patch<ApiResponse<T>>(url, data, options);
    return res.data;
  };

  // 通用请求
  const request = async <T = any>(
    config: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const res = await axiosInstance.request<ApiResponse<T>>(config);
    return res.data;
  };

  return {
    // 状态
    loading,
    // 方法
    get,
    post,
    postForm,
    put,
    putForm,
    delete: del, // 使用del避免与关键字冲突
    delForm: delForm,
    patch,
    request,
    // 实例
    axiosInstance,
  };
}

// 导出便捷方法
export default useHttp;
