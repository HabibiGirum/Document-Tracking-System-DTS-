const notFoundMiddleware=(req,res)=>{
    res.status(404).send('Router is not found')
}
export default notFoundMiddleware