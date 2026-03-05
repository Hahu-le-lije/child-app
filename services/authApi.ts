// export const loginChild=async(username:string,password:string)=>{
// const res=await fetch("",{
//     method:"POST",
//     headers:{
//         "Content-Type":"application/json"
//     },
//     body:JSON.stringify({username,password})
// });
// if(!res.ok){
//     throw new Error("Failed to login");
// }
// return  await res.json();
// }
// export const refreshToken=async(refreshToken:string)=>{
//     try{
//         const res=await fetch('',{
//             method:"POST",
//             headers:{
//                 "content-type":"application/json"
//             },
//             body:JSON.stringify({refreshToken})
//         })
//         const data=await res.json();
//         if(!res.ok){
//             throw new Error(data?.message || "Failed to refresh token ")
//         }
//         return data;
//     }catch(error:any){
//          throw new Error(error.message || "Network error");
//     }
// }
export const loginChild = async (username: string, password: string) => {

  // simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (username === "izzat" && password === "123") {
    return {
      accessToken: "dummy_access_token_123",
      refreshToken: "dummy_refresh_token_456",
      expiresIn: 3600,
      user: {
        id: "1",
        username: "izzat",
        role: "child"
      }
    };
  }

  throw new Error("Invalid username or password");
};



export const refreshToken = async (refreshToken: string) => {

  // simulate delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (refreshToken === "dummy_refresh_token_456") {
    return {
      accessToken: "new_dummy_access_token_789",
      refreshToken: "dummy_refresh_token_456"
    };
  }

  throw new Error("Failed to refresh token");
};