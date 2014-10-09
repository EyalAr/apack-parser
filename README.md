# Animations Pack Parser

Parses Animations Pack Syntax (see [specs](#animations-pack-specification)) and
builds an actions tree.

## Animations Pack Specification

**File Extension:** `.apack`

An animation pack is a set of instructions which defines a complex animation.

An animation pack allows you to:

0. Break down a complex animation into basic actions.
0. Define duration and parameters for each action unit.
0. Define timing and flow between animations.
0. Define events to be fired at certain points during the animation.

Animation packs are defined in an hierarchical manner in a tree-like structure.
Each node in the tree is an independent animation pack. A node's animation is
run when its parent's animation completes. Sibling nodes are run in parallel.

Animation packs are defined in `.apack` files in the following manner:

0. Each line represents a node in the tree.
0. The indentation of the line determines its level in the tree.
0. Each line contains the following information:
    0. Basic actions to perform and their parameters.
    0. The duration of the animation defined by this line.
    0. An event name to be fired at certain points during the execution of the
       animation ([see below](#events)).
    * Duration may be omitted. In this case, it will be assigned some default
      value.
    * Event name may not be specified. In this case no event will be fired when
      the animation completes.
    * A line may contain only an event name. In this case the node itself has
      no actions to perform. This may be used to group several lines under one
      event.
0. Actions within the same line are run in parallel.
0. Lines within the same indentation level are sibling nodes in the tree, and
   are run in parallel.

## Syntax

### Line syntax

`[ACTION] [P1] ... [Pn], [ACTION] [P1] ... [Pn], ... @[DURATION][UNITS] (EVENT)`

0. `ACTION`: See [supported actions](#supported-actions).
0. `P1, P2, ..., Pn`: The action's parameters.
0. `DURATION`: The duration of all the actions in this line.
0. `UNITS`: The time unit of the duration. See [time units](#time-units).
0. `EVENT`: The name of the event to be fired during the execution of this
   animation. See [events](#events).

**Example 1:**

`rotate 45, scale 2, translateX 0 -1000 @1.5s (mark1)`
 
 This defines an animation which:

 0. Rotates the object 45 degrees.
 0. Scales the object 200%.
 0. Moves the object horizontally from starting offset of -1000 to offset 0.

Each of those actions runs for 1.5 seconds.

0. The event `"mark1/start"` is fired when the animations start.
0. The event `"mark1/done"` is fired when the all the animations complete.

**Example 2:**

`rotate 45, scale 2`
 
 This defines an animation which:

 0. Rotates the object 45 degrees.
 0. Scales the object 200%.

No duration is defined and no events will be fired.

### Pack syntax

An animation pack is one or more lines.

**Example 1:**

```
rotate 45, scale 2 @200ms (mark1)
    color blue @300ms
    fade 0.5 @500 (mark2)
translateY 100 @1s (mark3)
```

Animation timeline:

0. *[t=0ms]*:
    0. Fire event `mark1/start`.
    0. Start `rotate`.
    0. Start `scale`.
    0. Fire event `mark3/start`.
    0. Start `translateY`.
0. *[t=200ms]*:
    0. `rotate` completes.
    0. `scale` completes.
    0. Fire event `mark1/middle`.
    0. Start `color`.
    0. Fire event `mark2/start`.
    0. Start `fade`.
0. *[t=500ms]*:
    0. `color` completes.
0. *[t=800ms]*:
    0. `fade` completes.
    0. Fire event `mark2/done`.
    0. Fire event `mark1/done`.
0. *[t=1000ms]*:
    0. `translateY` completes.
    0. Fire event `mark3/done`.

**Example 2:**

```
(mark1)
    rotate 45 @300 (mark2)
    (mark3)
        scale 2 @500 (mark4)
```

Animation timeline:

0. *[t=0ms]*:
    0. Fire event `mark1/start`.
    0. Fire event `mark2/start`.
    0. Start `rotate`.
    0. Fire event `mark3/start`.
    0. Fire event `mark4/start`.
    0. Start `scale`.
0. *[t=300ms]*:
    0. `rotate` completes.
    0. Fire event `mark2/done`.
0. *[t=500ms]*:
    0. `scale` completes.
    0. Fire event `mark4/done`.
    0. Fire event `mark3/done`.
    0. Fire event `mark1/done`.

## Events

When an event name is specified for an animation pack, the following events are
fired:

0. `event/start`: Before any of the actions and any of the children packs start.
0. `event/middle`: After the actions complete and before any of the children
   packs start.
0. `event/done`: After the children packs complete.

## Supported Actions

See Velocity.

## Time Units

Supported time duration units:

0. `"ms" / "msec" / "msecs"`: Milliseconds
0. `"s" / "sec" / "secs"`: Seconds
0. `"hr" / "hour" / "hours"`: Hours
