-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Normalize.Object.MaybeId exposing (id)

import Graphql.Internal.Builder.Argument as Argument exposing (Argument)
import Graphql.Internal.Builder.Object as Object
import Graphql.Internal.Encode as Encode exposing (Value)
import Graphql.Operation exposing (RootMutation, RootQuery, RootSubscription)
import Graphql.OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet exposing (SelectionSet)
import Json.Decode as Decode
import Normalize.InputObject
import Normalize.Interface
import Normalize.Object
import Normalize.Scalar
import Normalize.Union


id : SelectionSet (Maybe Normalize.Scalar.DogId) Normalize.Object.MaybeId
id =
    Object.selectionForField "(Maybe Scalar.DogId)" "id" [] (Object.scalarDecoder |> Decode.map Normalize.Scalar.DogId |> Decode.nullable)
