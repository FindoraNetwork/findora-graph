# Findora Graph

Findora Network has hosted a Graph Node server to empower developers building excellent dApps on the Findora chain. You can submit a PR to [deploy](#deploy-a-new-subgraph) and [update](#update-subgraphs) your own subgraphs here.

Graph Node is an open source Rust implementation that event sources the blockchain to deterministically update a data store that can be queried via the GraphQL endpoint.

For detailed instructions and more context, check out the [Graph Node Getting Started Guide](https://github.com/graphprotocol/graph-node/blob/master/docs/getting-started.md).

## Submit your subgraphs

> ....(add some rules here)

### Deploy a new subgraph

> ....(short descriptions)

- Fork this repository

- Copy example directory and rename the root directory to be the same as PR submitter's account.

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

- Submit your pull request, follow the instructions inside to edit your PR.

### Update subgraphs

> ....(short descriptions)

- Edit your subgraphs.

  > **Note**
  >
  > PR may only modify files in one directory at a time.

- Submit your pull request.

## How to

- Develop a subgraph:

  1 Generate base types from your `schema.graphql` settings.

    ```bash
    # graph codegen FindoraNetwork/example-subgraph/subgraph.yaml
    $ yarn gen FindoraNetwork/example-subgraph/subgraph.yaml
    # ...
    # ...
    # ✔ Generate types for GraphQL schema
    #
    # Types generated successfully
    ```

  2 Editing event mappings, such as `src/handleFRC721Transfer.ts` in the example directory.

  3 After editing, compile them to web assembly files:

    ```bash
    # graph build FindoraNetwork/example-subgraph/subgraph.yaml
    $ yarn build FindoraNetwork/example-subgraph/subgraph.yaml
    # ...
    # ✔ Write compiled subgraph to build/
    #
    # Build completed: .../FindoraNetwork/findora-graph/build/subgraph.yaml
    ```

- Run a local graph-node, to deploy and test your subgraph:

  1 Install Docker in your machine.

  2 Start graph-node:

    ```bash
    # In the project root:
    $ docker-compose up
    # Starting findora-graph_ipfs_1       ... done
    # Recreating findora-graph_postgres_1 ... done
    # Recreating findora-graph_graph-node_1 ... done
    # ...
    ```

  3 Create a new subgraph edge:

    ```bash
    # graph create --node http://127.0.0.1:8020 findora/example
    $ yarn create:local findora/example
    ```

  4 Deploy your subgraph:

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

  5 Browse http://127.0.0.1:8000/subgraphs/name/findora/example/graphql to explore your results.
