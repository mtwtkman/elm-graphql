-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Github.Object.StargazerEdge exposing (cursor, node, starredAt)

import Github.InputObject
import Github.Interface
import Github.Object
import Github.Scalar
import Github.Union
import Graphql.Internal.Builder.Argument as Argument exposing (Argument)
import Graphql.Internal.Builder.Object as Object
import Graphql.Internal.Encode as Encode exposing (Value)
import Graphql.Operation exposing (RootMutation, RootQuery, RootSubscription)
import Graphql.OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet exposing (SelectionSet)
import Json.Decode as Decode


cursor : SelectionSet String Github.Object.StargazerEdge
cursor =
    Object.selectionForField "String" "cursor" [] Decode.string


node : SelectionSet decodesTo Github.Object.User -> SelectionSet decodesTo Github.Object.StargazerEdge
node object_ =
    Object.selectionForCompositeField "node" [] object_ identity


{-| Identifies when the item was starred.
-}
starredAt : SelectionSet Github.Scalar.DateTime Github.Object.StargazerEdge
starredAt =
    Object.selectionForField "Scalar.DateTime" "starredAt" [] (Object.scalarDecoder |> Decode.map Github.Scalar.DateTime)
