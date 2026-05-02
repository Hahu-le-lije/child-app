const BASE_URL=''
export const audioPronouncation=async(audioUri:string,targetWord:string)=>{
try{
const formData=new FormData()
formData.append("targetWord", targetWord)
formData.append("audio",{
    uri:audioUri,
    type:"audio/m4a",
    name:"recording.m4a"
}as any)
const res=await fetch(`${BASE_URL}/game/speech`,{
    method:"POST",
    body:formData,
})
if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Failed to score pronunciation");
        }

        return await res.json();
}catch(error){
    console.log("error in sending audio data ", error)
    throw error
}
}
export const wordExplanation=async(word:string,language:string)=>{
try{
    const res=await fetch(`${BASE_URL}/game/word`,{
        method:"POST",
        headers:{
            "Content-Type": "application/json",
        },
        body:JSON.stringify({
            word:word,
            language:language
        })
    })
    if(!res.ok){
        throw new Error("error in getting the word meaning")
    }
return await res.json()
}catch(error){
    console.log("error in sending the word", error)
}
}