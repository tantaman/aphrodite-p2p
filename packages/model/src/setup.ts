// What does setup look like?
// 1. Create logs (persist log, replicate log)
// 2. Wire persistor and replicator to logs
// 3. Create context, add logs to it
// 4. Add storage resolvers/providers to context

// setup doesn't exist in the model package but rather the
// client code using the model
