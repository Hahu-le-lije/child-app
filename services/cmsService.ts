import {
    getUser
} from "@/services/authStorage";
export const fetchCMSData=async()=>{
    const user=await getUser();
    
    try{
        const res=await fetch ("",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({
                childid:user.id
            })
        })
        const data=await res.json();
        return data

    }catch(e){
        console.error("cms fetch error: ",e);
        throw e;
    }
}