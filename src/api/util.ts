import request from "@/utils/request";


export const toUp = (data: any) => {
    return request<any>({
        url: "/util/dm/toUp", // mock接口
        method: "post",
        data,
    });
};