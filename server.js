/**
	call the original spdy' request.push, and but wrap it's callback in _pushStream
	@param path the location to send to
	@param headers the headers to send with
	@param cb the callback to fire with the stream-out, when ready.
*/
function _push(path,headers,cb,prio){
	return this.session._xacPush.call(res,path,headers,_pushStream.bind(res,path,cb))
}

/**
	wraps a spdy request.push callback with an additional step which records the path of this X-Associated-Content
	@param path the path being written to
	@param cb the original callback we've wrapped
	@param err potential errors getting the push stream
	@param stream the push stream to write to
*/
function _pushStream(path,cb,err,stream){
	this.session.xac.push(path)
	this.session.save()
	return cb(err,stream)
}

module.exports.xac= xac

/**
	X-Associated-Content records the path of spdy.push calls to a session store, and yields those headers to the first outgoing headers to occur.
*/
function xac(req,res,next){

	// we need our session in response
	var session= res.session= req.session

	// we need to have xac loaded into the session
	if(!session.xac){
		session.xac= []
		session._xacPush= res.push
	}

	// in last call for headers, add any queued xac's
	res.on("header",function(){
		var session= this.session
		if(session.xac)
			for(var i in session.xac){
				this.setHeader("x-associated-content",session.xac[i])
			}
		session.xac= []
		session.save()
	}.bind(res))

	// record outgoing push'es in XAC records
	res.push= _push

	// if this request is just for XACs, give it.
	if(req.url == "/next"){
		res.statusCode= 204
		res.end()
		return
	}

	// loaded in
	next()
}

/*
var PORT= 443
var webapp= express()
webapp.use(express.bodyParser())
webapp.use(express.cookieParser())
webapp.use(express.session())
webapp.use(module.exports.stomp)
spdy.createServer(webapp).listen(PORT)
*/
