update segments
set
  review_status = 'ai_proposed',
  is_public = false
where review_status is distinct from 'ai_proposed'
  or is_public is distinct from false;
