# LifeRX TCM Pattern Assessment
This document outlines the questions, scoring logic, and results framework for the 5-step Traditional Chinese Medicine (TCM) assessment used in the LifeRX dashboard.

## Step 1: Five Elements Constitution
These questions establish the patient's lifelong constitutional baselines (each checked item = +2 points to the respective element).

### Wood (Liver / Hun)
*Focus: Drive, movement, direction, frustration, stress reactivity*
- I am goal-oriented and tend to push forward even when tired.
- I become frustrated or irritated easily.
- Stress shows up as tension, headaches, or tight shoulders.
- I prefer control, structure, and decisive action.

### Fire (Heart / Shen)
*Focus: Expression, connection, joy, overstimulation, restlessness*
- I am expressive, social, or emotionally open.
- I deal with restlessness, anxiety, or insomnia.
- I often feel overstimulated or mentally scattered.
- My mind feels busy, especially at night.

### Earth (Spleen / Yi)
*Focus: Nourishment, worry, digestion, grounding, support*
- I am nurturing and often take care of others first.
- I overthink or worry a lot.
- I struggle with bloating, heaviness, or sluggish digestion.
- I crave sweets or comfort foods when stressed.

### Metal (Lung / Po)
*Focus: Order, grief, boundaries, refinement, dryness*
- I value order, cleanliness, and precision.
- I tend to hold grief, sadness, or emotional reserve.
- Dry skin, dry cough, or respiratory sensitivity are familiar to me.
- I can be self-critical or highly discerning.

### Water (Kidney / Zhi)
*Focus: Essence, endurance, fear, will, restoration*
- I often feel depleted, exhausted, or deeply taxed.
- Fear, insecurity, or uncertainty is a recurring theme for me.
- I experience low back weakness, weak knees, or low reserve.
- I need solitude or stillness to recover.

---

## Step 2: Current Symptoms
These questions refine the constitutional baseline into present-time imbalances (each checked item = +1 point to mapped elements).

- Bloating or abdominal fullness *(Maps to: Earth)*
- Constipation or dry stools *(Maps to: Metal, Wood)*
- Loose stools or digestive weakness *(Maps to: Earth)*
- Headaches, especially tension-related *(Maps to: Wood)*
- Difficulty falling or staying asleep *(Maps to: Fire, Water)*
- Anxiety, agitation, or palpitations *(Maps to: Fire)*
- Fatigue or energy crashes *(Maps to: Earth, Water)*
- Dry skin, dry throat, dry cough *(Maps to: Metal)*
- Fixed pain, tightness, or irritability with stress *(Maps to: Wood)*
- Low back weakness or frequent urination *(Maps to: Water)*

---

## Step 3: Emotional Pattern Map
Emotions help identify the spirit dimension of imbalance (each checked item = +1 point to mapped element).

- Anger / frustration *(Maps to: Wood)*
- Overexcitement / emotional overstimulation *(Maps to: Fire)*
- Worry / rumination *(Maps to: Earth)*
- Grief / difficulty letting go *(Maps to: Metal)*
- Fear / insecurity *(Maps to: Water)*

---

## Step 4: Life Phase & Transition (Medical Yi Jing Layer)
Adds narrative meaning and interpretive overlay (each selection = +1 or +2 points to specific elements).

- **I feel stuck and unable to move forward.** 
  - *Hint:* Suggests stagnation / constrained movement. *(+1 Wood)*
- **I am in a period of transformation.** 
  - *Hint:* Suggests transition and dynamic reorganization. *(+1 Fire)*
- **I feel depleted and need restoration.** 
  - *Hint:* Suggests deficiency and rebuilding. *(+2 Water)*
- **I am building something new.** 
  - *Hint:* Suggests growth, initiative, and emergence. *(+1 Wood)*
- **I feel out of alignment with my purpose.** 
  - *Hint:* Suggests spirit-level reassessment and redirection. *(+1 Metal)*

---

## Step 5: Output Report & Logic

### Inference Logic
The system calculates a total score for each of the 5 Elements (Wood, Fire, Earth, Metal, Water) based on the above point values. 

1. **Primary/Secondary:** The highest score is the "Primary" constitution. The second highest is the "Secondary".
2. **Current Pattern Impression:** The primary element is combined with specific "Current Symptoms" selected in Step 2 to infer a TCM pattern:
   - *Primary Earth + Bloating/Loose stools* = Spleen Qi deficiency with Dampness
   - *Primary Wood + Headaches/Pain* = Liver Qi stagnation
   - *Primary Fire + Insomnia/Anxiety* = Heart Shen disturbance
   - *Primary Water + Low Back/Fatigue* = Kidney Qi / Jing depletion
   - *Primary Metal + Dryness* = Lung dryness / Metal imbalance
   - *Fallback:* [Primary]-[Secondary] constitutional blend

### Result Themes by Primary Element

**Primary Wood**
- *Clinical Theme:* Liver Qi stagnation / constrained movement
- *LifeRX Focus:* Reduce internal pressure, regulate movement, soften frustration, restore flow.
- *Food Direction:* Leafy greens, lightly cooked vegetables, sour flavors in moderation.
- *Practice Direction:* Breath + stretching, walking, Qi Gong, boundary reset.

**Primary Fire**
- *Clinical Theme:* Heart Shen disturbance / heat or overstimulation
- *LifeRX Focus:* Calm the mind, reduce overstimulation, anchor sleep, regulate emotional intensity.
- *Food Direction:* Bitter greens, cooling teas, less stimulants.
- *Practice Direction:* Evening routine, meditation, screen reduction, paced speech.

**Primary Earth**
- *Clinical Theme:* Spleen Qi deficiency / damp accumulation
- *LifeRX Focus:* Strengthen digestion, reduce dampness, simplify meals, interrupt overthinking.
- *Food Direction:* Warm cooked meals, roots, soups, less sugar and cold food.
- *Practice Direction:* Meal regularity, abdominal breathing, grounding rituals.

**Primary Metal**
- *Clinical Theme:* Lung Qi deficiency / dryness or unresolved grief
- *LifeRX Focus:* Support breath, hydration, boundaries, and emotional release.
- *Food Direction:* Pears, soups, white radish, moistening foods.
- *Practice Direction:* Breathwork, grief acknowledgment, decluttering, rhythmic walks.

**Primary Water**
- *Clinical Theme:* Kidney deficiency / depleted reserves
- *LifeRX Focus:* Restore reserve, protect sleep, conserve essence, rebuild steadily.
- *Food Direction:* Mineral-rich broths, black sesame, beans, warming foods.
- *Practice Direction:* Earlier sleep, restorative exercise, heat, pacing and recovery.