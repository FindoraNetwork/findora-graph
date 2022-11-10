# The Graph
The Graph is an indexing protocol for organizing blockchain data and making it easily accessible with GraphQL.
  
## Findora Graph

Findora Network has hosted a Graph Node server to empower developers to build dApps on the Findora chain. Subgraphs can be deployed and updated using a pull request for this repo (see below for instructions).

Graph node is an opensource Rust implementation that indexes the blockchain to deterministically update a data store that can be queried via the GraphQL endpoint.

Check out the Graph Node [Getting Started Guide](https://github.com/graphprotocol/graph-node/blob/master/docs/getting-started.md) for detailed instructions and more context.

### How to create and test your subgraph locally

This example will walk you through the steps to create a new subgraph and test it on a local node on your machine.

#### Generate a subgraph

1- Clone this repo.

2- Generate base types from your `schema.graphql` settings.

```bash
# graph codegen FindoraNetwork/example-subgraph/subgraph.yaml
$ yarn gen FindoraNetwork/example-subgraph/subgraph.yaml
# ...
# ...
# ✔ Generate types for GraphQL schema
#
# Types generated successfully
```

3- Edit event mappings, such as `src/handleFRC721Transfer.ts` in the example directory.

4- After editing, compile them to web assembly files:

```bash
# graph build FindoraNetwork/example-subgraph/subgraph.yaml
$ yarn build FindoraNetwork/example-subgraph/subgraph.yaml
# ...
# ✔ Write compiled subgraph to build/
#
# Build completed: .../FindoraNetwork/findora-graph/build/subgraph.yaml
```

#### Run a local graph-node to deploy and test your subgraph:

1- Install [Docker](https://www.docker.com/) on your machine.

2- Start graph-node:

```bash
# In the project root:
$ docker-compose up
# Starting findora-graph_ipfs_1       ... done
# Recreating findora-graph_postgres_1 ... done
# Recreating findora-graph_graph-node_1 ... done
# ...
```

3- Create a new subgraph edge:

```bash
# graph create --node http://127.0.0.1:8020 findora/example
$ yarn create:local findora/example
```

4-  Deploy your subgraph:

```bash
# graph deploy                                    \
#    --product hosted-service                     \
#    --node http://127.0.0.1:8020                 \
#    --ipfs http://127.0.0.1:5001                 \
#    findora/example                              \
#    FindoraNetwork/example-subgraph/subgraph.yaml
$ yarn deploy:local findora/example FindoraNetwork/example-subgraph/subgraph.yaml
# ? Version Label (e.g. v0.0.1) ›
# ...
```

5- Browse [http://127.0.0.1:8000/subgraphs/name/findora/example/graphql](http://127.0.0.1:8000/subgraphs/name/findora/example/graphql) to explore.

### Submit and deploy your subgraph

When you've tested your subgraph locally, you can now submit it to be deployed on the Findora mainnet node. This is done by submitting a pull request.

#### Deploy a new subgraph

1- Fork this repo.

2- Copy the `FindoraNetwork/` directory and rename the root directory to be the same as your github handle.

```bash
$ cp -r FindoraNetwork <github-handle> && cd $_

## Edit `authors.json`
#
#  Those PRs edit the directory contents but not in the author's list (authors.json) wouldn't be accepted!

$ mv example-subgraph <subgraph-name> && cd $_

## Edit subgraph settings in `subgraph.yaml`
#
#  * dataSources.name must rename to your directory name to avoid naming collision

## Edit your graph relations in `schema.graphql` and mapping scripts.
```

3- Create a pull request and follow the template instructions before submitting your PR.

4- Your subgraph will be deployed upon review and made available at `https://graph.findora.org/subgraphs/name/<github-handle>/<your-subgraph>/graphql`

e.g. [https://graph.findora.org/subgraphs/name/FindoraNetwork/example-subgraph/graphql](https://graph.findora.org/subgraphs/name/FindoraNetwork/example-subgraph/graphql)

#### Update subgraphs

To update an existing subgraph, you may simply create another PR with you modifications.

**NOTE: PRs may only modify one directory at a time.**
