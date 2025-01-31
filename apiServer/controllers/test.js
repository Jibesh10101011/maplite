function testApi(req,res) {
    return res.status(200).json({message:"Nice to meet you"});
}

module.exports = { testApi };