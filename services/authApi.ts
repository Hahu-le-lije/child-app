export const loginChild=async(username:string,password:string)=>{
const res=await fetch("",{
    method:"POST",
    headers:{
        "Content-Type":"application/json"
    },
    body:JSON.stringify({username,password})
});
if(!res.ok){
    throw new Error("Failed to login");
}
return  await res.json();
}
export const refreshToken=async(refreshToken:string)=>{
    try{
        const res=await fetch('',{
            method:"POST",
            headers:{
                "content-type":"application/json"
            },
            body:JSON.stringify({refreshToken})
        })
        const data=await res.json();
        if(!res.ok){
            throw new Error(data?.message || "Failed to refresh token ")
        }
        return data;
    }catch(error:any){
         throw new Error(error.message || "Network error");
    }
}